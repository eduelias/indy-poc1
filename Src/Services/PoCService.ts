import { IndyActor } from '@Model/Indy/Actor';
import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { IndyDidService } from '@Services/Indy/IndyDidService';
import { IndyService } from '@Services/Indy/IndyService';
import { IndyStewardService } from '@Services/Indy/IndyStewardService';
import { queryForTx } from '@Services/Indy/PoolerService';
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

    const stdServer = new SocketServer('Steward', htmlServer.getHtmlServer());
    stdServer.listen(4000);
    stdServer.on('onboard', async (data) => {
      if (!state[data.name]) {
        const newData = new IndyActor(data.name, data.id, data.key, data.seed);
        state[data.name] = newData;
      }

      if (!stdServer.activeConnection) throw new Error('No active connection');
      const stdService = new IndyStewardService(
        indyService,
        new SocketLogger(stdServer.activeConnection),
      );

      stdService.onboard(
        await indyService.getPool(),
        steward,
        state[data.name],
      );
    });

    const governmentServer = new SocketServer(
      'Government',
      htmlServer.getHtmlServer(),
    );
    governmentServer.listen(4001);

    const aliceServer = new SocketServer('Alice', htmlServer.getHtmlServer());
    aliceServer.listen(4002);

    const ledgerExplorer = new SocketServer(
      'Ledger',
      htmlServer.getHtmlServer(),
    );
    ledgerExplorer.on('connection', (socket) => {
      const queue: any[] = [];
      queryForTx((data) => {
        queue.push(data);
      });
      setInterval(() => {
        if (queue.length) {
          socket.emit('newtx', queue);
          queue.length = 0;
        }
      }, 1000);
    });
    ledgerExplorer.listen(4040);
  }
}
