import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UsersEntity } from '../../users/users.entity/users.entity';
import { NewsEntity } from '../../news/news.entity/news.entity';

@Entity('comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  message: string;

  @ManyToOne(
    () => UsersEntity,
    (user) => {
      user.comments;
    },
  )
  user: UsersEntity;

  @ManyToOne(() => NewsEntity, (news) => news.comments)
  news: number; //NewsEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
