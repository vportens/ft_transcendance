import { Injectable } from '@nestjs/common';
import { Discussion, Channel, ChannelUser } from '@prisma/client';
import { ChannelService } from './channel/channel.service';
import { ChannelDto, CreateChannelDto } from './channel/dto';
import { ChatGateway } from './chat.gateway';
import { DiscussionService } from './discussion/discussion.service';
import { CreateDiscussionDto, DiscussionDto } from './discussion/dto';
import { DiscussionWithUsers } from './discussion/types';

@Injectable()
export class ChatService {
    constructor(
        private chatGateway: ChatGateway,
        private discService: DiscussionService,
        private channelService: ChannelService,
    ) {}

    //////////////////////////
    //  DISCUSSION METHODS  //
    //////////////////////////

    //  GET /discussion
    //  RETURNS ALL DISCUSSIONS OF GIVEN USER
    async getDiscussions(currentUserId: number) :
    Promise<Discussion[]>
    {
        const discussions: Discussion[] = await this.discService.getDiscussions(currentUserId);
        return discussions;
    }

    //  GET /discussion/:id
    //  RETURNS A Discussion FOR GIVEN :id
    async getDiscussionById(currentUserId: number, discId: number) :
    Promise<Discussion>
    {
        const discussion = await this.discService.findOne(currentUserId, discId);
        return discussion;
    }

    //  POST /discussion
    async createDiscussion(
        currentUserId: number,
        user2Id: number,
    ) :
    Promise<DiscussionWithUsers>
    {
        const dto: CreateDiscussionDto = {
            user1Id: currentUserId,
            user2Id: user2Id,
        };
        const discussion: DiscussionWithUsers = await this.discService.create(dto);

        this.chatGateway.joinDiscRoom(discussion.user1Id, discussion.id);
        this.chatGateway.joinDiscRoom(discussion.user2Id, discussion.id);

        const newDiscDto: DiscussionDto = {
            user1Id: discussion.user1Id,
            user2Id: discussion.user2Id,
            username1: discussion.user1.username,
            username2: discussion.user2.username,
            id: discussion.id,
        };
        this.chatGateway.newDisc(newDiscDto);
        return discussion;
    }

    //////////////////////
    //  CHANNEL METHODS //
    //////////////////////

    //  GET /channel/all
    async getAllPublicChannels(currentUserId: number) : 
    Promise<Channel[]>
    {
        const channels: Channel[] = await this.channelService.allPublic(currentUserId);
        return channels;
    }

    //  GET /channel
    async getAllChannelsForUser(userId: number) :
    Promise<Channel[]>
    {
        const channels: Channel[] = await this.channelService.allForUser(userId);
        return channels;
    }

    //  POST /channel
    async createChannel(
        currentUserId: number,
        dto: CreateChannelDto
    ) :
    Promise<Channel>
    {
        const channel: Channel = await this.channelService.create(currentUserId, dto);
        this.chatGateway.joinChannelRoom(currentUserId, channel.id);
        return channel;
    }

    //  POST /channel/join + ChannelDto
    async joinChannel(
        currentUserId: number,
        dto: ChannelDto,
    ) : 
    Promise<Channel>
    {
        const channel: Channel = await this.channelService.join(currentUserId, dto);
        return channel;
    }

}
