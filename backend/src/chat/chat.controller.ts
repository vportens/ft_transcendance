import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Discussion, Channel, ChannelUser, ChannelBan, ChannelMute } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { ChannelBanDto } from './channel/channel-ban/dto';
import { ChannelMuteDto, CreateChannelMuteDto } from './channel/channel-mute/dto';
import { ChannelUserRoleDto, ChannelUserStatusDto } from './channel/channel-user/dto';
import { Roles } from './channel/decorators/roles.decorator';
import { ChannelDto, CreateChannelDto, EditChannelDto } from './channel/dto';
import { RolesGuard } from './channel/guards/roles.guard';
import { ChatService } from './chat.service';
import { CreateDiscussionBodyDto } from './discussion/dto';
import { DiscussionWithUsers } from './discussion/types';

@UseGuards(JwtGuard, RolesGuard)
@Controller()
export class ChatController {

    constructor(
        private chatService: ChatService,
    ) { }

    //////////////////////////
    //  DISCUSSION REQUESTS //
    //////////////////////////

    @Get('discussion')
    async getDiscussions(@GetUser('id') currentUserId: number):
        Promise<Discussion[]> {
        return await this.chatService.getDiscussions(currentUserId);
    }

    @Get('discussion/:id')
    async getDiscussionById(
        @GetUser('id') currentUserId: number,
        @Param('id', ParseIntPipe) discId: number,
    ):
        Promise<Discussion> {
        const discussion = await this.chatService.getDiscussionById(currentUserId, discId);
        return discussion;
    }

    @Get('discussion/user/:id')
    async getDiscussionByUserId(
        @GetUser('id') currentUserId: number,
        @Param('id', ParseIntPipe) user2Id: number,
    ):
        Promise<Discussion> {
        const discussion = await this.chatService.getDiscussionByUserIds(currentUserId, user2Id);
        return discussion;
    }

    //  POST /discussion
    @Post('discussion')
    async createDiscussion(
        @GetUser('id') currentUserId: number,
        @Body() body: CreateDiscussionBodyDto,
    ):
        Promise<DiscussionWithUsers> {
        return this.chatService.createDiscussion(currentUserId, body.user2Id);
    }

    //////////////////////////
    //  CHANNEL REQUESTS    //
    //////////////////////////

    // @Get('channels/all')
    @Get('channel/all')
    async getAllPublicChannels(@GetUser('id') currentUserId: number)
        : Promise<Channel[]> {
        const channels: Channel[] = await this.chatService.getAllPublicChannels(currentUserId);
        return channels;
    }

    // @Get('channels')
    @Get('channel')
    async getAllChannelsForUser(@GetUser('id') currentUserId: number)
        : Promise<Channel[]> {
        const channels: Channel[] = await this.chatService.getAllChannelsForUser(currentUserId);
        return channels;
    }

    @Get('channel/:chanId')
    async getChannelWusersWmessages(
        @GetUser('id') currentUserId: number,
        @Param('chanId') chanId: number,
    )
        : Promise<Channel> {
        const channel = await this.chatService.getChannelWusersWmessages(currentUserId, chanId);
        return channel;
    }

    @Post('channel')
    async createChannel(
        @GetUser('id') currentUserId: number,
        @Body() createChanDto: CreateChannelDto,
    ): Promise<Channel> {
        const channel: Channel = await this.chatService.createChannel(currentUserId, createChanDto);
        return channel;
    }

    // @Post('channel/:chanId/join')
    @Post('channel/join')
    async joinChannel(
        @GetUser('id') currentUserId: number,
        @Body() channelDto: ChannelDto,
    ): Promise<Channel> {
        const channel: Channel = await this.chatService.joinChannel(currentUserId, channelDto);
        return channel;
    }

    @HttpCode(200)
    // @Post('channel/:chanId/leave')
    @Post('channel/leave')
    async leaveChannel(
        @GetUser('id') currentUserId: number,
        @Body() channelDto: ChannelDto,
    ): Promise<Channel> {
        const channel: Channel = await this.chatService.leaveChannel(currentUserId, channelDto);
        return channel;
    }

    // EDIT Channel/:id (name)
    @Patch('channel/:chanId')
    @Roles('owner')
    async editChannel(
        @GetUser('id') currentUserId: number,
        @Param('chanId', ParseIntPipe) chanId: number,
        @Body() dto: EditChannelDto,
    )
        : Promise<Channel> {
        const channel = await this.chatService.editChannel(currentUserId, chanId, dto);
        return channel;
    }

    // DELETE Channel/:id
    @Delete('channel/:chanId')
    @Roles('owner')
    async deleteChannel(
        @Param('chanId', ParseIntPipe) chanId: number,
    )
        : Promise<Channel> {
        // const channel = await this.chatService.deleteChannel(dto.chanId);
        const channel = await this.chatService.deleteChannel(chanId);
        return channel;
    }

    //////////////////////////////
    //  CHANNELUSER REQUESTS    //
    //////////////////////////////

    // INVITE USER
    // @Post('channel/:chanId/user/:userId')
    @Post('channel/:chanId/user/:userId/add')
    @Roles('admin')
    async inviteUserToChannel(
        @GetUser('id') currentUserId: number,
        @Param('chanId', ParseIntPipe) chanId: number,
        @Param('userId', ParseIntPipe) userId: number,
    )
        : Promise<ChannelUser> {
        const channelUser = await this.chatService.inviteUserToChannel(currentUserId, chanId, userId);
        return channelUser;
    }

    // EDIT ChannelUser'S status OR role
    // @Patch('channel/:chanId/user/:userId')
    @Patch('channelUser/role')
    @Roles('owner')
    async editChannelUserRole(
        @GetUser('id') currentUserId: number,
        @Body() dto: ChannelUserRoleDto,
    )
        : Promise<ChannelUser> {
        const channelUser = await this.chatService.editChannelUserRole(currentUserId, dto);
        return channelUser;
    }

    ///////////////////
    //  BAN REQUESTS //
    ///////////////////

    // @Post('channel/:chanId/user/:userId/ban')
    @Post('channelUser/ban')
    @Roles('admin')
    async ban(@Body() dto: ChannelBanDto)
        : Promise<ChannelBan> {
        const channelBan = await this.chatService.banChannelUser(dto);
        return channelBan;
    }

    // @Delete('channel/:chanId/user/:userId/ban')
    @Delete('channelUser/ban')
    @Roles('admin')
    async unban(dto: ChannelBanDto)
        : Promise<ChannelBan> {
        const channelBan = await this.chatService.unbanChannelUser(dto);
        return channelBan;
    }

    ////////////////////
    //  MUTE REQUESTS //
    ////////////////////

    // @Post('channel/:chanId/user/:userId/mute')
    @Post('channelUser/mute')
    @Roles('admin')
    async mute(
        @Body() dto: CreateChannelMuteDto,
    )
        : Promise<ChannelMute> {
        const channelMute = await this.chatService.muteChannelUser(dto);
        return channelMute;
    }

    // @Delete('channel/:chanId/user/:userId/mute')
    @Delete('channelUser/mute')
    @Roles('admin')
    async unmute(dto: ChannelMuteDto)
        : Promise<ChannelMute> {
        const channelMute = await this.chatService.unmuteChannelUser(dto);
        return channelMute;
    }

    // @Patch('channel/:chanId/user/:userId/mute')
    @Patch('channelUser/mute')
    @Roles('admin')
    async editMute(dto: CreateChannelMuteDto)
        : Promise<ChannelMute> {
        const channelMute = await this.chatService.editMute(dto);
        return channelMute;
    }

}
