import { Module } from '@nestjs/common';
import { SocketGatewayService } from './socket-gateway.service';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_SERVICES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE,
          useFactory: (ConfigService: ConfigService) => ({
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE_CLIENT_ID,
                brokers: [ConfigService.get('BROKER_0_URI')],
              },
              consumer: {
                groupId: KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE_GROUP_ID,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),
  ],
  providers: [SocketGatewayService],
})
export class SocketGatewayModule {}
