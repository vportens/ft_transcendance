import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Discussion } from '@prisma/client';
import { DiscussionMessageService } from 'src/chat/discussion-message/discussion-message.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDiscussionDto, DiscussionDto } from './dto';
import { ChatGateway } from '../chat.gateway';
import { DiscussionMessageDto } from '../discussion-message/dto';

@Injectable()
export class DiscussionService {

    constructor(
        private prisma: PrismaService,
        private discMsgService: DiscussionMessageService,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) {}

    //  POST /discussion/:user2Id
    //  RETURNS NEW DISCUSSION WITH messages: []
    async create(dto: CreateDiscussionDto) :
    Promise<Discussion>
    {
        const discussion = await this.prisma.discussion.create({
            data: {
                user1Id: dto.user1Id,
                user2Id: dto.user2Id,
            },
            include: {
                user1: { select: { id: true, username: true } },
                user2: { select: { id: true, username: true } },
                messages: { select: { text: true, userId: true } }, 
            },
        });
        const newDiscDto: DiscussionDto = {
            user1Id: discussion.user1Id,
            user2Id: discussion.user2Id,
            username1: discussion.user1.username,
            username2: discussion.user2.username,
            id: discussion.id,
        }
        this.chatGateway.joinDiscRoom(discussion.user1Id, discussion.id);
        this.chatGateway.joinDiscRoom(discussion.user2Id, discussion.id);
        this.chatGateway.newDisc(discussion.id, newDiscDto);
        return discussion;
    }

    //  GET /discussion
    //  RETURNS ALL DISCUSSIONS OF GIVEN USER
    async getDiscussions(currentUserId: number) :
    Promise<Discussion[]>
    {
        const discussions: Discussion[] = await this.prisma.discussion.findMany({
            where: {
                OR: [ { user1Id: currentUserId }, { user2Id: currentUserId } ]
            },
            include: {
                user1: { select: { id: true, username: true, } },
                user2: { select: { id: true, username: true, } },
                messages: { select: { text: true, userId: true } },
            },
        }); 
        return discussions;
    }

    createDiscMsg(dto: DiscussionMessageDto) :
    void
    {
        this.discMsgService.create(dto);
    }
}