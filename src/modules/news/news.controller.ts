import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
  Render,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  UseInterceptors,
  HttpException,
  Request,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { FileLoaderHelper } from '../../utils/FileLoaderHelper';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NewsCreateDto } from '../../dtos/news/create-news/create-news.dto';
import { NewsEntity } from './news.entity/news.entity';
import { CommentsService } from '../comments/comments.service';
import { MailService } from '../mail/mail.service';
import { NewsService } from './news.service';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';
import { Public } from '../auth/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

const helperFileLoader = new FileLoaderHelper('/news');

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly commentsService: CommentsService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  // Get all
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: [NewsEntity],
  })
  @Public()
  @Get()
  @Render('news/list')
  async getViewAll(@Req() req: any) {
    const news = await this.newsService.getAll();
    const user = await this.usersService.findById(req?.user?.id);

    return {
      news: news,
      title: 'Лучшие кликбейтовые новости',
      nickname: user?.nickname,
    };
  }

  // Get 1
  @ApiParam({
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
  @Public()
  @Get('/details/:newsId')
  @Render('news/detail')
  async getView(@Param('newsId', ParseIntPipe) newsId: number) {
    const item = this.newsService.findById(newsId);
    const comments = this.commentsService.findAll(newsId);

    return Promise.all([item, comments]).then((res) => {
      return {
        news: res[0],
        comments: res[1],
        title: 'Детали новости',
      };
    });
  }

  // Get view for update
  @ApiParam({
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
  @Get('/update/:newsId')
  @Render('news/update')
  async getViewForUpdate(@Param('newsId', ParseIntPipe) newsId: number) {
    const news = await this.newsService.findById(newsId);

    // Format date for input
    const formatted = news.createdAt.toLocaleDateString('en-CA');
    const data = {
      ...news,
      createdAt: formatted,
    };
    return { news: data, title: 'Обновление новости' };
  }

  // Create
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: NewsEntity,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: helperFileLoader.path,
        filename: helperFileLoader.customFileName,
      }),
    }),
  )
  async create(
    @Body() news: NewsCreateDto,
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    cover: Express.Multer.File,
  ): Promise<NewsEntity> {
    // Write down given path
    // req.news.cover = cover.path;
    // return this.newsService.create(req.news, req.user.id);
    news.cover = cover.path;
    return this.newsService.create(news, req.user.id);
  }

  // Update
  @ApiParam({
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
  @Roles(Role.User)
  @Patch('/update/:newsId')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: helperFileLoader.path,
        filename: helperFileLoader.customFileName,
      }),
    }),
  )
  async update(
    @Param('newsId') newsId: number,
    @Body() news: NewsCreateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    cover: Express.Multer.File,
    @Res() response,
  ): Promise<Response> {
    // Write down given path
    news.cover = cover.path;

    const currentNews = await this.newsService.findById(newsId);
    const editedNews = await this.newsService.update(newsId, news);

    if (!editedNews || !currentNews) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Новость не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Set array of differencies
    const newsDiff = Object.entries(editedNews).map((v, i) => {
      if (news[i] === v) return { itemName: i, old: news[i], new: v };
    });

    // Send mail
    return await this.mailService
      .sendNewsUpdate(['putyour@emails.here'], { newsDiff, newsId })
      .then(() => {
        return response.status(HttpStatus.OK).json(
          {
            status: 'OK',
            message: 'Новость была изменена',
          },
          HttpStatus.OK,
        );
      })
      .catch((e) => {
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
  @Delete('/:newsId')
  async remove(
    @Param('newsId') newsId: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsService.delete(newsId) &&
      this.commentsService.deleteAll(newsId)
      ? res.status(HttpStatus.OK).send(`Post with ID ${newsId} was removed`)
      : res.status(HttpStatus.NOT_FOUND).send(`Something went wrong`);
  }
}
