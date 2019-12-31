import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { PoolerService, db, setCb } from '@Services/Indy/PoolerService';
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
      publicDid: 'Th7MpTaRZVRYnPiabds81Y',
      publicDidSeed: '000000000000000000000000Steward1',
    });

    const steward3 = new RestAgency();
    steward3.run({
      url: new URL('http://localhost:3001'),
      label: 'Steward3',
      walletName: 'steward3Wallet',
      walletKey: 'steward3wallet_key',
      publicDid: '4cU41vWW82ArfxJxHkzXPG',
      publicDidSeed: '000000000000000000000000Steward3',
    });

    const poolerservice = new PoolerService();
    await poolerservice.Init();

    const ledgerExplorer = new SocketServer(
      'Ledger',
      htmlServer.getHtmlServer(),
    );
    ledgerExplorer.on('connection', (socket) => {
      const memDb = {};

      Object.keys(db).map((ledger) => {
        const arr = Array.from(db[ledger]);
        memDb[ledger] = arr
          .filter((tx: any) => tx && tx.result)
          .map((tx: any) => tx.result.data);
        socket.on(`get_${ledger}`, (paging) =>
          Array.from(db[ledger]).slice(paging.start, paging.end),
        );
      });

      socket.emit(`init_txs`, memDb);
      setCb((ledger, tx) => socket.emit(`newtx_${ledger}`, tx.result.data));
    });
    ledgerExplorer.listen(4040);
  }
}
