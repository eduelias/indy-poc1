import { IndyDidService } from './indy/DidService';
import { IndyStewardService } from './indy/IndyStewardService';
import { IndyActor } from '@model/indy/Actor';
import { HtmlServer } from '@servers/HtmlServer';
import { SocketServer } from '@servers/SocketServer';
import { ConfigSchema, ConfigService } from '@services/ConfigService';
import { IndyService } from '@services/indy/IndyService';
import { PoolService } from '@services/PoolService';
import { SocketLogger } from '@services/SocketLogger';

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
