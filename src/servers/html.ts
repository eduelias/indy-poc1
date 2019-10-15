import { readFile } from 'fs';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { join } from 'path';

export class HtmlServer {
  htmlServer: Server;

  constructor() {
    this.htmlServer = createServer(this.handler);
  }

  public listen(port: number): void {
    this.htmlServer.listen(port);
  }

  public getHtmlServer(): Server {
    return this.htmlServer;
  }

  public handler(req: IncomingMessage, res: ServerResponse): void {
    readFile(
      join(__dirname, '..', '..', 'static_content', 'html', 'index.html'),
      (err, data) => {
        if (err) {
          res.writeHead(500);
          return res.end('index file not found.');
        }

        res.writeHead(200);
        res.end(data);
      },
    );
  }
}
