import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Request,
  Patch,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from '../../dtos/user/create-user/create-user.dto';
import { UsersService } from './users.service';
import { Public } from '../auth/decorators/public.decorator';
import { AuthExceptionFilter } from '../../filters/auth-exceptions.filter';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersEntity } from './users.entity/users.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Public()
  @Get('signin')
  @Render('users/signin')
  async renderSignin() {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Public()
  @Get('signup')
  @Render('users/signup')
  async renderSignup() {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: 'string',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Get('/profile')
  @UseFilters(AuthExceptionFilter)
  @Render('users/profile')
  async renderAccount(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);

    // return w/o password
    const { password, ...result } = user;

    return { user: result };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UsersEntity,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Patch('/update')
  async update(@Body() user: CreateUserDto, @Request() req: any) {
    return this.usersService.update(user, req.user.id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UsersEntity,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Public()
  @Post('/create')
  async create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }
}
