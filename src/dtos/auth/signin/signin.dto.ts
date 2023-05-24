import { IsString, IsNotEmpty } from 'class-validator';
import { IUser } from '../../../modules/users/users.interface';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto implements IUser {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
