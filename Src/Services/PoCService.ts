import { HtmlServer } from '@Servers/HtmlServer';
import { SocketServer } from '@Servers/SocketServer';
import { ConfigSchema, ConfigService } from '@Services/ConfigService';
import { PoolerService, db, setCb } from '@Services/Indy/PoolerService';
import { RestAgency } from 'aries-sdk-ts-beta';
import { URL } from 'url';
import Express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = Express();
app.use(bodyParser.json());

const whitelist = [undefined, 'http://localhost:8080'];
const corsOptions = {
  origin: function(origin, callback): any {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS ${origin}`));
    }
  },
};

// import { Agency } from 'aries-sdk-ts';
// import { PoolService } from '@Services/PoolService';
// import { SocketLogger } from '@Services/SocketLogger';

function paginate(array: any[], pageSize: number, pageNumber: number): any[] {
  --pageNumber; // because pages logically start with 1, but technically with 0
  return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
}

const types = {
  DOMAIN: {
    '1': 'NYM',
    '100': 'ATTRIB',
    '101': 'SCHEMA',
    '102': 'CRED_DEF',
    '113': 'REVOC_REG_DEF',
    '114': 'REVOC_REG_ENTRY',
  },
  POOL: {
    '0': 'NODE',
  },
  CONFIG: {
    '4': 'TXN_AUTHOR_AGREEMENT',
    '5': 'TXN_AUTHOR_AGREEMENT_AML',
    '8': 'TRANSACTION_AUTHOR_AGREEMENT_DISABLE',
    '109': 'POOL_UPGRADE',
    '110': 'NODE_UPGRADE',
    '111': 'POOL_CONFIG',
    '120': 'AUTH_RULES',
  },
};

export class PoCService {
  public state: { [key: string]: any } = {};
  public async start(): Promise<void> {
    let pagesize = 45;
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

    app.get(
      '/tx/:ledger/:page/:pagesize?/:filter?',
      cors(corsOptions),
      async (req, res) => {
        const {
          ledger: ledgerRaw,
          pagesize,
          page,
          filter: filterString,
        } = req.params;
        const ledger = ledgerRaw.toUpperCase();
        const filter = JSON.parse(filterString);
        console.log(filter);
        const ar = db[ledger.toUpperCase()];
        const toRet = paginate(
          ar
            .filter(
              (x) =>
                x && (!filter || (filter && filter[types[ledger][x.txn.type]])),
            )

            .sort((a, b) => b.txnMetadata.seqNo - a.txnMetadata.seqNo),
          pagesize,
          page,
        );

        res.status(200).json(toRet);
      },
    );

    app.get('/nym/:verkey', cors(corsOptions), async (req, res) => {
      const { verkey: data } = req.params;
      const nym: any = db.DOMAIN.filter(
        (tx: any) => tx && tx?.txn.type == '1',
      ).find((tx: any) => tx?.txn?.data?.dest.slice(0, 5) === data.slice(0, 5));

      res.status(200).json(nym);
    });

    const port = process.env.PORT || 3333;
    app.listen(port, async () => {
      console.log(`Application started on port: ${port}`);
    });

    const ledgerExplorer = new SocketServer(
      'Ledger',
      htmlServer.getHtmlServer(),
    );
    ledgerExplorer.on('connection', (socket) => {
      socket.on('load_nym', (data) => {
        const nym: any = db.DOMAIN.find(
          (tx: any) =>
            tx.txn &&
            tx.txn.data &&
            tx.txn.type === '1' &&
            tx.txn.data.dest.slice(0, 5) === data.slice(0, 5),
        );
        socket.emit(`nym_${data}`, nym);
      });

      Object.keys(db).map((ledger) => {
        socket.on(`get_${ledger}`, ({ page, pageSize }) => {
          pagesize = pageSize || pagesize;
          const ar = db[ledger.toUpperCase()];
          socket.emit(
            `page_loaded_${ledger}_${page}`,
            paginate(
              ar
                .filter((x) => x)
                .map((t) => t.data)
                .sort((a, b) => b.seqNo - a.seqNo),
              pagesize,
              page,
            ),
          );
        });
      });

      socket.emit(`init_txs`, {
        DOMAIN: db.DOMAIN.slice(pagesize * -1),
        POOL: db.POOL.slice(pagesize * -1),
        CONFIG: db.CONFIG.slice(pagesize * -1),
      });

      setCb((ledger, tx) => socket.emit(`newtx_${ledger}`, tx.data));
    });
    ledgerExplorer.listen(4040);
  }
}
