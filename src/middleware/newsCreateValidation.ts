import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { validateOrReject } from 'class-validator';
import { NewsCreateDto } from 'src/dtos/news/create-news/create-news.dto';

@Injectable()
export class NewsCreateValidation implements NestMiddleware {
  async use(req: any, res: Response, next: NextFunction) {
    console.log(req.body, req.file);
    const body = req.body;
    const news = new NewsCreateDto();
    const errors = [];
    Object.keys(body).forEach((key) => {
      news[key] = body[key];
    });
    // Set userId
    news['user'] = req?.user?.id;
    // console.log(news);
    try {
      await validateOrReject(news);
    } catch (errs) {
      errs.forEach((err) => {
        Object.values(err.constraints).forEach((constraint) =>
          errors.push(constraint),
        );
      });
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }
    next();
  }
}
