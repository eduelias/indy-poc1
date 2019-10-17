import { HtmlServer } from '@servers/HtmlServer';
import { SocketServer } from '@servers/SocketServer';
import { ConfigSchema, ConfigService } from '@services/ConfigService';
import { IndyService } from '@services/IndyService';
import { PoolService } from '@services/PoolService';

export class PoCService {
  public async start(): Promise<void> {
    const cfgService = new ConfigService();
    const config: ConfigSchema = cfgService.GetConfig();

    const htmlServer = new HtmlServer();
    htmlServer.listen(config.port);

    const poolService = new PoolService(config);

    const indyService = new IndyService(config, poolService, console);
    console.log(indyService.getPool());

    const faberServer = new SocketServer('Faber', htmlServer.getHtmlServer());
    faberServer.listen(3000);

    const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
    aliceServer.listen(3001);
  }
}
