import { IsNotEmpty, IsString } from 'class-validator';
import { IComment } from '../../../modules/comments/comments.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CommentUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;
}
