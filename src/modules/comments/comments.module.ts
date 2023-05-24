import { Module, forwardRef } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from './comments.entity/comments.entity';
import { NewsModule } from '../news/news.module';
import { UsersModule } from '../users/users.module';
import { SocketCommentsGateway } from './socket-comments.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, SocketCommentsGateway],
  imports: [
    TypeOrmModule.forFeature([CommentsEntity]),
    forwardRef(() => NewsModule),
    UsersModule,
    AuthModule,
  ],
  exports: [TypeOrmModule.forFeature([CommentsEntity]), CommentsService],
})
export class CommentsModule {}
