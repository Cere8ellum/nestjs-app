import { IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';
import { INews } from '../../../modules/news/news.interface';
import { ApiProperty } from '@nestjs/swagger';

export class NewsCreateDto implements INews {
  // @IsNotEmpty()
  // @IsNumber()
  // user: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @ValidateIf((o) => o.cover)
  cover: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  createdAt: Date;
}
