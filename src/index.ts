import './Alias';
import { HtmlServer } from '@servers/HtmlServer';
import { SocketServer } from '@servers/SocketServer';
import { ConfigService } from '@services/ConfigService';

const cfgService = new ConfigService();

const htmlServer = new HtmlServer();
htmlServer.listen(cfgService.GetConfig().port);

const faberServer = new SocketServer('Faber', htmlServer.getHtmlServer());
faberServer.listen(3000);

const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
aliceServer.listen(3001);
