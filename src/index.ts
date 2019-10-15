import './alias';
import { HtmlServer } from '@servers/html';
import { SocketServer } from '@servers/socket';

const htmlServer = new HtmlServer();
htmlServer.listen(80);

const faberServer = new SocketServer('Faber', htmlServer.getHtmlServer());
faberServer.listen(3000);

const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
aliceServer.listen(3001);
