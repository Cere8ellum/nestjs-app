import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INews } from './news.interface';
import { NewsEntity } from './news.entity/news.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { NewsCreateDto } from 'src/dtos/news/create-news/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private usersService: UsersService,
  ) {}

  async create(news: NewsCreateDto, userId): Promise<NewsEntity> {
    const newsEntity = new NewsEntity();

    newsEntity.title = news.title;
    newsEntity.description = news.description;
    // Replace backslashes to forward
    news.cover = news.cover.replace(/\\/g, '/');
    // remove /public from path
    news.cover = news.cover.replace('public', '');
    newsEntity.cover = news.cover;
    const _user = await this.usersService.findById(Number(userId));
    newsEntity.user = _user;
    return await this.newsRepository.save(newsEntity);
  }

  async update(newsId: number, news: INews): Promise<NewsEntity | null> {
    const editableNews = await this.findById(newsId);

    try {
      if (editableNews) {
        // Replace backslashes to forward
        news.cover = news.cover.replace(/\\/g, '/');
        // remove /public from path
        news.cover = news.cover.replace('public', '');

        const newsEntity = new NewsEntity();
        newsEntity.title = news.title || editableNews.title;
        newsEntity.description = news.description || editableNews.description;
        newsEntity.cover = news.cover || editableNews.cover;

        // If the entity already exist in the database, it is updated.
        // If the entity does not exist in the database, it is inserted.
        return await this.newsRepository.save(newsEntity);
      }
      return null;
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getAll(): Promise<NewsEntity[]> {
    return this.newsRepository.find({});
  }

  findById(id: INews['id']): Promise<NewsEntity> {
    const news = this.newsRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
    });

    if (!news) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Новость не найдена',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return news;
  }

  async delete(id): Promise<NewsEntity | null> {
    const removeNews = await this.findById(id);
    if (removeNews) {
      return this.newsRepository.remove(removeNews);
    }
    return null;
  }
}
