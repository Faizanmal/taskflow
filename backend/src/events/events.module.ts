import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';

/**
 * Events Module - WebSocket functionality
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') as string,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
