import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WebsocketMessagesService } from './websocket-messages.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class WebsocketMessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly websocketMessagesService: WebsocketMessagesService,
    private readonly jwtService: JwtService,
  ) {}
  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.websocketMessagesService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({ payload });
    // console.log('cliente conectado', client.id);

    // console.log({
    //   connectedClients: this.websocketMessagesService.getConnectedClients(),
    // });

    // Unirse a un canal y emitir a ese canal:
    // client.join('ventas');
    // this.wss.to('ventas').emit('')
    this.wss.emit(
      'clients-updated',
      this.websocketMessagesService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    // console.log('cliente desconectado', client.id);
    this.websocketMessagesService.removeClient(client.id);
    console.log({
      connectedClients: this.websocketMessagesService.getConnectedClients(),
    });
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // console.log(client.id, payload);
    // Emite solamente a un cliente, no a todos
    // client.emit('message-from-server', {
    //   fullname: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });

    //! Emitir a todos menos al cliente del argumento
    // client.broadcast.emit('message-from-server', {
    //   fullname: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });

    //! Emitir a todos
    this.wss.emit('message-from-server', {
      fullname: this.websocketMessagesService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
