import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './strategies/constants';
import { LocalStrategy } from './strategies/local.startegy';
import { AuthValidation } from '../../middleware/authValidation';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { RolesGuard } from './roles/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    // Checking auth (session) globally
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
    SessionSerializer,
    // Checking roles globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    // For sessions
    PassportModule.register({ session: true }),
  ],
  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Dto validation
    consumer
      .apply(AuthValidation)
      .forRoutes({ path: 'auth/signin', method: RequestMethod.POST });
  }
}
