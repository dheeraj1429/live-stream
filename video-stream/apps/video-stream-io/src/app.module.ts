import { Module } from '@nestjs/common';
import * as joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { SocketGatewayModule } from './socket-gateway';

@Module({
  imports: [
    ConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: joi.object({
        PORT: joi.number().required(),
        BROKER_0_URI: joi.string().required(),
      }),
    }),
    SocketGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
