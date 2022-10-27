import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Discussion, Channel } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { domainToASCII } from 'url';
import { ChannelDto, CreateChannelDto } from './channel/dto';
import { ChatService } from './chat.service';
import { CreateDiscussionBodyDto } from './discussion/dto';
import { DiscussionWithUsers } from './discussion/types';

@UseGuards(JwtGuard)
@Controller()
export class ChatController {

    constructor (
        private chatService: ChatService,
    ) {}

    //////////////////////////
    //  DISCUSSION REQUESTS //
    //////////////////////////

    @Get('discussion')
    async getDiscussions(@GetUser('id') currentUserId: number) :
    Promise<Discussion[]>
    {
        return await this.chatService.getDiscussions(currentUserId);
    }

    @Get('discussion/:id')
    async getDiscussionById(
        @GetUser('id') currentUserId: number,
        @Param('id', ParseIntPipe) discId: number,
    ) :
    Promise<Discussion>
    {
        const discussion = await this.chatService.getDiscussionById(currentUserId, discId);
        return discussion;
    }

    @Get('discussion/user/:id')
    async getDiscussionByUserId(
        @GetUser('id') currentUserId: number,
        @Param('id', ParseIntPipe) user2Id: number,
    )
    // : Promise<Discussion>
    {
        const discussion = await this.chatService.getDiscussionByUserIds(currentUserId, user2Id);
        if (discussion === null) {
            return (JSON.stringify(null));
        }
        return discussion;
    }

    //  POST /discussion/:user2Id
    @Post('discussion')
    async createDiscussion(
        @GetUser('id') currentUserId: number,
        @Body() body: CreateDiscussionBodyDto, 
    ) :
    Promise<DiscussionWithUsers>
    {
        console.log(body);
        console.log('POST(\'discussion\')createDiscussion() - body.user2Id = ' + body.user2Id);
        console.log('POST(\'discussion\')createDiscussion() - currentUserId = ' + currentUserId);
        return await this.chatService.createDiscussion(currentUserId, body.user2Id);
    }

    //////////////////////////
    //  CHANNEL REQUESTS    //
    //////////////////////////

    @Get('channel/all')
    async getAllPublicChannels(@GetUser('id') currentUserId: number) :
    Promise<Channel[]>
    {
        const channels: Channel[] = await this.chatService.getAllPublicChannels(currentUserId);
        return channels;
    }

    @Get('channel')
    async getAllChannelsForUser(
        @GetUser('id') currentUserId: number,
    )
    : Promise<Channel[]>
    {
        const channels: Channel[] = await this.chatService.getAllChannelsForUser(currentUserId);
        return channels;
    }

    @Post('channel')
    async createChannel(
        @GetUser('id') currentUserId: number,
        @Body() createChanDto: CreateChannelDto,
    ) :
    Promise<Channel>
    {
        const channel: Channel = await this.chatService.createChannel(currentUserId, createChanDto);
        return channel;
    }

    @Post('channel/join')
    async joinChannel(
        @GetUser('id') currentUserId: number,
        @Body() channelDto: ChannelDto,
        ) : Promise<Channel> {
            const channel: Channel = await this.chatService.joinChannel(currentUserId, channelDto);
            return channel;
    }

    // @Post('channel/leave')
    // async leaveChannel() {

    // }

    // @Patch('channel')
    // async editChannel() {

    // }

    // //   DELETE Channel/:id
    // //   ONLY IF USER IS OWNER
    // @Delete('channel/:chanId')
    // async deleteChan() {
    // } 

    // //   UPDATE Channel/:id (name)
    // //   ONLY IF USER IS OWNER
    // //   INVITE OTHER User
    // //   IF CurrentUser ID ADMIN
    // @Patch('channel/:chanId')
    // async updateChan() {
    // } 
    
    // @Get('channel')
    // async getChannels(@GetUser('id') currentUserId: number)
    // Promise<Channel[]>
    // {
        // const channels: Channel[] = await this.channelService.getChannelsByUserId(currentUserId);
        // return channels;
    // }

}
