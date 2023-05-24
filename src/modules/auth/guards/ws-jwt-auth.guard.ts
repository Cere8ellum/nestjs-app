import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as cookieParser from 'cookie-parser';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      // Get client from websocket
      const client = context.switchToWs().getClient();
      // Get auth token from  client
      const cookies: string[] = client.handshake.headers.cookie.split('; ');
      const jwt = cookies.find((c) => !c.indexOf('jwt')).split('=')[1];

      // Checking auth via authService
      const isAuth = await this.authService.verify(jwt);

      if (isAuth) {
        const user = await this.authService.decode(jwt);
        context.switchToWs().getClient().data.user = user;
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
