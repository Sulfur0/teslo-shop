import { Module } from '@nestjs/common';
import { WebsocketMessagesService } from './websocket-messages.service';
import { WebsocketMessagesGateway } from './websocket-messages.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [WebsocketMessagesGateway, WebsocketMessagesService],
  imports: [AuthModule],
})
export class WebsocketMessagesModule {}
