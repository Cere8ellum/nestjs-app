import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  ParseIntPipe,
  Render,
  Patch,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { NewsService } from '../news/news.service';
import { CreateCommentDto } from '../../dtos/comments/create-comment/create-comment.dto';
import { CommentUpdateDto } from '../../dtos/comments/update-comment/update-comment.dto';
import { IComment } from './comments.interface';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';
import { CommentsEntity } from './comments.entity/comments.entity';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly newsService: NewsService,
  ) {}

  @ApiParam({ name: 'newsId', required: true, description: 'News identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: [CommentsEntity],
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Public()
  @Get(':newsId')
  get(@Param('newsId', ParseIntPipe) newsId: number) {
    return this.commentsService.findAll(newsId).then((res) => {
      return res;
    });
  }

  // Get view for update
  @ApiParam({
    name: 'commentId',
    required: true,
    description: 'Comment identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Get('/update/:commentId')
  @Render('comments/update')
  async getViewForUpdate(@Param('commentId', ParseIntPipe) commentId: number) {
    const comment = await this.commentsService.findById(commentId);

    return { comment: comment, title: 'Обновление Комментария' };
  }

  // Create
  @ApiQuery({
    name: 'newsId',
    required: true,
    description: 'News identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('/create')
  async create(
    @Query('newsid') newsId: number,
    @Body() comment: CreateCommentDto,
    @Request() req: any,
  ): Promise<string> {
    return this.newsService.findById(newsId).then(() => {
      return this.commentsService
        .create(req.user.id, newsId, comment.text)
        .then((res) => res.toString());
    });
  }

  // Update
  @ApiParam({
    name: 'commentId',
    required: true,
    description: 'Comment identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Roles(Role.User)
  @Patch('/update/:commentid')
  async update(
    @Param('commentid', ParseIntPipe) commentId: number,
    @Body() comment: CommentUpdateDto,
    @Request() req: any,
    @Res() response,
  ): Promise<Response> {
    return await this.commentsService
      .update(req.user.id, comment)
      .then(() => {
        return response.status(HttpStatus.OK).json(
          {
            status: 'OK',
            message: 'Комментарий был изменён',
          },
          HttpStatus.OK,
        );
      })
      .catch((e) => {
        console.log(e);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  // Delete 1
  @ApiParam({
    name: 'commentId',
    required: true,
    description: 'Comment identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: CommentsEntity,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Roles(Role.User, Role.Admin)
  @Delete(':commentId')
  remove(
    @Param('commentId', ParseIntPipe) commentId,
    @Request() req: any,
  ): Promise<CommentsEntity> {
    return this.commentsService.delete(commentId, req.user.id);
  }
}
