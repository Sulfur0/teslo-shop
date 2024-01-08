import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Usado para especificar las configuraciones
    // de throttling localmente
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 10,
    //   },
    // ]),
    // Usado para obtener las configuraciones de
    // rate limit de las variables de entorno
    // ThrottlerModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => [
    //     {
    //       ttl: configService.getOrThrow('UPLOAD_RATE_TTL'),
    //       limit: configService.getOrThrow('UPLOAD_RATE_LIMIT'),
    //     },
    //   ],
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class FilesModule {}
