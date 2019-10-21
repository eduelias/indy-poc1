import { IndyDidService } from './Indy/IndyDidService';
import { IndyStewardService } from './Indy/IndyStewardService';
import { IndyActor } from '@Model/Indy/Actor';
import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { IndyService } from '@Services/Indy/IndyService';
import { PoolService } from '@Services/PoolService';
import { SocketLogger } from '@Services/SocketLogger';

export class PoCService {
  public async start(): Promise<void> {
    const state: { [key: string]: any } = {};
    const config: ConfigSchema = new ConfigService().GetConfig();
    const poolService = new PoolService(config);
    const indyService = new IndyService(config, poolService, console);
    const didService = new IndyDidService(indyService, console);

    const htmlServer = new HtmlServer();
    htmlServer.listen(config.port);

    const stdServer = new SocketServer('Steward', htmlServer.getHtmlServer());
    stdServer.listen(4000);
    stdServer.on('onboard', async (data) => {
      if (!state['steward']) {
        const steward = new IndyActor(
          'Steward 001',
          'stewardWalletName',
          'steward_key',
          '000000000000000000000000Steward1',
        );
        steward.did = await didService.createAndStoreDid(steward, {
          seed: steward.seed,
        });
        state['steward'] = steward;
      }

      const steward = state['steward'];

      if (!stdServer.activeConnection) throw new Error('No active connection');
      const stdService = new IndyStewardService(
        indyService,
        new SocketLogger(stdServer.activeConnection),
      );

      if (!state[data.name]) {
        const newData = new IndyActor(data.name, data.id, data.key, data.seed);
        state[data.name] = newData;
      }

      stdService.onboard(
        await indyService.getPool(),
        steward,
        state[data.name],
      );
    });

    const faberServer = new SocketServer('Faber', htmlServer.getHtmlServer());
    faberServer.listen(4001);

    const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
    aliceServer.listen(4002);
  }
}
