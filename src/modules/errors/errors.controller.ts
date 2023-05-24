import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('errors')
export class ErrorsController {
  @Public()
  @Get('/404')
  getNotFound() {}
}
