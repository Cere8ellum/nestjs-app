import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @Render('index')
  getHello(): { message: string; title: string } {
    return { message: 'Привет мир!', title: 'Главная' };
  }
}
