import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from '../../modules/auth/guards/ws-jwt-auth.guard';
import { CommentsService } from './comments.service';
import { EventsComment } from './EventsComment.enum';

export type Comment = { message: string; newsId: number };

@WebSocketGateway()
export class SocketCommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('addComment')
  async handleCreate(client: Socket, comment: Comment) {
    const { newsId, message } = comment;
    const userId: number = client.data.user.id;
    const createdComment = await this.commentsService.create(
      userId,
      newsId,
      message,
    );

    this.server.to(newsId.toString()).emit('newComment', createdComment);
  }

  @OnEvent(EventsComment.remove)
  handleRemoveCommentEvent(payload) {
    const { commentId, news } = payload;
    this.server.to(news.id.toString()).emit('removeComment', { id: commentId });
  }

  @OnEvent(EventsComment.edit)
  handleEditCommentEvent(payload) {
    const { commentId, news, comment } = payload;

    // Клиенты подписанные на канал newsId
    this.server
      .to(news.id.toString())
      .emit('editComment', { id: commentId, comment });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const { newsId } = client.handshake.query;
    client.join(newsId);
    this.logger.log(`Client connected: ${client.id}`);
  }
}
