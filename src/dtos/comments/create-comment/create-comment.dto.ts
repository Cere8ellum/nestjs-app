import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IComment } from '../../../modules/comments/comments.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto implements IComment {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  // @IsNumber()
  // @IsNotEmpty()
  // news: number;

  // @IsNumber()
  // @IsNotEmpty()
  // user: number;
}
