import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { queryForTx } from '@Services/Indy/PoolerService';
import { RestAgency } from 'aries-sdk-ts-beta';
import { URL } from 'url';
// import { Agency } from 'aries-sdk-ts';
// import { PoolService } from '@Services/PoolService';
// import { SocketLogger } from '@Services/SocketLogger';

export class PoCService {
  public state: { [key: string]: any } = {};
  public async start(): Promise<void> {
    const config: ConfigSchema = new ConfigService().GetConfig();
    // const poolService = new PoolService(config);

    const htmlServer = new HtmlServer();
    htmlServer.listen(config.port);

    const steward = new RestAgency();
    steward.run({
      url: new URL('http://localhost:3000'),
      label: 'Steward',
      walletName: 'Steward Wallet',
      walletKey: 'steward_key',
      publicDidSeed: '000000000000000000000000Steward1',
    });

    const government = new RestAgency();
    government.run({
      url: new URL('http://localhost:3001'),
      label: 'Government',
      walletName: 'governmentWallet',
      walletKey: 'government_key',
      publicDidSeed: '000000000000000000000000Govrnmt1',
    });

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
