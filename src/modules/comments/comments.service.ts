import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentsEntity } from './comments.entity/comments.entity';
import { NewsService } from '../news/news.service';
import { UsersService } from '../users/users.service';
import { IComment } from './comments.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsComment } from './EventsComment.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    private readonly newsService: NewsService,
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: number,
    newsId: number,
    comment: string,
  ): Promise<CommentsEntity> {
    // Get News
    const news = await this.newsService.findById(newsId);
    if (!news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Новость не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Get User
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Пользователь не найден',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const commentEntity = new CommentsEntity();
    commentEntity.news = newsId; //news;
    commentEntity.user = user;
    commentEntity.message = comment;

    return this.commentsRepository.save(commentEntity);
  }

  async update(userId: number, data: IComment): Promise<CommentsEntity> {
    // Get Comment
    const comment = await this.findById(data.id);
    if (!comment) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Комментарий не найден',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Get User
    const user = await this.userService.findById(data.user);

    if (user.id !== userId) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    comment.message = data.text;
    const updated = await this.commentsRepository.save(comment);

    this.eventEmitter.emit(EventsComment.edit, {
      commentId: data.id,
      news: comment.news,
      comment: updated,
    });

    return updated;
  }

  async delete(commentId: number, userId: number): Promise<CommentsEntity> {
    // Get Comment
    const comment = await this.findById(commentId);
    if (!comment) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Комментарий не найден',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Get User
    const user = await this.userService.findById(userId);

    if (user.id !== comment.user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Недостаточно прав для удаления',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const deleted = await this.commentsRepository.remove(comment);
    this.eventEmitter.emit('comment.remove', {
      commentId,
      news: comment.news,
    });

    return deleted;
  }

  async deleteAll(idNews) {
    const _comments = await this.findAll(idNews);
    return await this.commentsRepository.remove(_comments);
  }

  findById(id: IComment['id']): Promise<CommentsEntity> {
    return this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'news'],
    });
  }

  async findAll(newsId: number): Promise<CommentsEntity[]> {
    return await this.commentsRepository.find({
      where: { news: newsId },
      relations: ['user'],
    });
  }
}
