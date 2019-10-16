import { Server } from 'http';
import io from 'socket.io';

/**
 * Socket server handler
 *
 * @export
 * @class SocketServer
 */
export class SocketServer {
  server: io.Server | undefined;

  constructor(public name: string | undefined, public htmlServer: Server) {}

  public listen(port: number): void {
    this.server = io(this.htmlServer).listen(port);
    this.on('connection', (socket) => {
      console.log(`user connected at ${this.name} through port ${port}.`);
      socket.emit('welcome', { message: 'hello' });
    });
  }

  public on(
    event: string,
    listener: (socket: io.Socket) => void,
  ): io.Namespace {
    if (!this.server) {
      throw new Error('listener not set');
    }
    return this.server.on(event, listener);
  }
}
