import { Server } from 'http';
import io from 'socket.io';

/**
 * Socket server handler
 *
 * @export
 * @class SocketServer
 */
export class SocketServer {
  events: { [name: string]: (...args: any[]) => void } = {};
  server: io.Server | undefined;
  activeConnection?: io.Socket;
  constructor(public name: string | undefined, public htmlServer: Server) {
    this.server = io(this.htmlServer);
  }

  public listen(port: number): void {
    if (!this.server) throw new Error('Socket server offlien');

    this.server.listen(port);
    this.server.on('connection', (socket: io.Socket) => {
      this.activeConnection = socket;
      console.log(`user connected at ${this.name} through port ${port}.`);
      socket.emit('welcome', { message: 'hello' });
      socket.on('disconnect', () => {
        console.log(`user ${this.name} disconnected from port ${port}`);
        socket.emit('goodbye', {
          message: `Bye ${this.name}!`,
        });
      });

      Object.keys(this.events).map((event) =>
        socket.on(event, this.events[event]),
      );
    });
  }

  public on(event: string, listener: (socket: any) => void): void {
    this.events[event] = listener;
  }
}
