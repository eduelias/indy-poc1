import './Alias';
import { HtmlServer } from '@servers/HtmlServer';
import { SocketServer } from '@servers/SocketServer';

const htmlServer = new HtmlServer();
htmlServer.listen(80);

const faberServer = new SocketServer('Faber', htmlServer.getHtmlServer());
faberServer.listen(3000);

const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
aliceServer.listen(3001);
