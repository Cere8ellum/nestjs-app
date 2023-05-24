import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CommentsModule } from '../comments/comments.module';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsEntity } from './news.entity/news.entity';
import { UsersModule } from '../users/users.module';
import { NewsCreateValidation } from '../../middleware/newsCreateValidation';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  imports: [
    TypeOrmModule.forFeature([NewsEntity]),
    forwardRef(() => CommentsModule),
    UsersModule,
    MailModule,
  ],
  exports: [TypeOrmModule.forFeature([NewsEntity]), NewsService],
})
export class NewsModule {
  // configure(consumer: MiddlewareConsumer): void {
  //   consumer
  //     .apply(NewsCreateValidation)
  //     .forRoutes({ path: 'news/create', method: RequestMethod.POST });
  // }
}
