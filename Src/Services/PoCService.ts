import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { watch, queryPage, db, setCb } from '@Services/Indy/PoolerService';
import { RestAgency } from 'aries-sdk-ts-beta';
import { URL } from 'url';
import sizeof from 'object-sizeof';

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

    const buildPromises = (cb, size, step = 50): any[] => {
      return Array.from(
        { length: Math.ceil(size / step) },
        (v, i) => i * step,
      ).map((i) => cb(i));
    };

    console.time('LoadLedger');

    const int = setInterval(() => {
      console.log(
        `Loaded DOMAIN/${
          db.DOMAIN.filter((tx: any) => tx && tx.result).length
        } and CONFIG/${
          db.CONFIG.filter((tx: any) => tx && tx.result).length
        } records. ${sizeof(db.DOMAIN)}`,
      );
    }, 2000);

    await Promise.all([
      queryPage('POOL'),
      ...buildPromises((n) => queryPage('CONFIG', n), 8000, 400),
      ...buildPromises((n) => queryPage('DOMAIN', n), 60000, 1500),
      // queryPage('CONFIG', 2),
      // queryPage('DOMAIN', 100),
      // queryPage('DOMAIN', 150),
      // queryPage('DOMAIN', 200),
      // queryPage('DOMAIN', 250),
      // queryPage('DOMAIN', 300),
      // queryPage('DOMAIN', 350),
      // queryPage('DOMAIN', 400),
      // queryPage('DOMAIN', 50),
      // queryPage('DOMAIN'),
    ]);

    clearInterval(int);

    console.timeEnd('LoadLedger');

    console.log(`Loaded ${db.DOMAIN.length} records.}`);

    watch('DOMAIN', db.DOMAIN.length, 2000);
    watch('POOL', db.POOL.length, 2000);
    watch('CONFIG', db.CONFIG.length, 2000);

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
