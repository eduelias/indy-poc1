import { IndyReq, ledgerType, type } from './Explorer';
import sizeof from 'object-sizeof';

export const ledgers = ['POOL', 'CONFIG', 'DOMAIN'];

export const db = {
  POOL: [],
  DOMAIN: [],
  CONFIG: [],
};

/**
 * This function will break a dataset reading job by
 * a predicted size and a batch-size "step"
 *
 * @param cb The callback that will be executed sliced
 * @param size The predicted size of the whole batch
 * @param step The step size
 */
const buildPromises = (cb, size, step = 50): any[] => {
  return Array.from(
    { length: Math.ceil(size / step) },
    (v, i) => i * step,
  ).map((i) => cb(i));
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
let globalCb = (ledger, data) => {};

const getIndy = (): any =>
  IndyReq({
    // builderNet,  first line from: https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis
    genesisTxn:
      //  '{"reqSignature":{},"txn":{"data":{"data":{"alias":"FoundationBuilder","blskey":"3gmhmqpPLqznZF3g3niodaHjbpsB6TEeE9SpgXgBnZJLmXgeRzJqTLajVwbhxrkomJFTFU4ohDC4ZRXKbUPCQywJuPAQnst8XBtCFredMECn4Z3goi1mNt5QVRdU8Ue2xMSkdLpsQMjCsNwYUsBguwXYUQnDXQXnHqRkK9qrivucQ5Z","blskey_pop":"RHWacPhUNc9JWsGNdmWYHrAvvhsow399x3ttNKKLDpz9GkxxnTKxtiZqarkx4uP5ByTwF4kM8nZddFKWuzoKizVLttALQ2Sc2BNJfRzzUZMNeQSnESkKZ7U5vE2NhUDff6pjANczrrDAXd12AjSG61QADWdg8CVciZFYtEGmKepwzP","client_ip":"35.161.146.16","client_port":"9702","node_ip":"50.112.53.5","node_port":"9701","services":["VALIDATOR"]},"dest":"GVvdyd7Y6hsBEy5yDDHjqkXgH8zW34K74RsxUiUCZDCE"},"metadata":{"from":"V5qJo72nMeF7x3ci8Zv2WP"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fe991cd590fff10f596bb6fe2362229de47d49dd50748e38b96f368152be29c7"},"ver":"1"}',
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"ev1","client_ip":"54.207.36.81","client_port":"9702","node_ip":"18.231.96.215","node_port":"9701","services":["VALIDATOR"]},"dest":"GWgp6huggos5HrzHVDy5xeBkYHxPvrRZzjPNAyJAqpjA"},"metadata":{"from":"J4N1K1SEB8uY2muwmecY5q"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"b0c82a3ade3497964cb8034be915da179459287823d92b5717e6d642784c50e6"},"ver":"1"}',
    // '{"reqSignature":{},"txn":{"data":{"data":{"alias":"FoundationBuilder","blskey":"3gmhmqpPLqznZF3g3niodaHjbpsB6TEeE9SpgXgBnZJLmXgeRzJqTLajVwbhxrkomJFTFU4ohDC4ZRXKbUPCQywJuPAQnst8XBtCFredMECn4Z3goi1mNt5QVRdU8Ue2xMSkdLpsQMjCsNwYUsBguwXYUQnDXQXnHqRkK9qrivucQ5Z","blskey_pop":"RHWacPhUNc9JWsGNdmWYHrAvvhsow399x3ttNKKLDpz9GkxxnTKxtiZqarkx4uP5ByTwF4kM8nZddFKWuzoKizVLttALQ2Sc2BNJfRzzUZMNeQSnESkKZ7U5vE2NhUDff6pjANczrrDAXd12AjSG61QADWdg8CVciZFYtEGmKepwzP","client_ip":"35.161.146.16","client_port":"9702","node_ip":"50.112.53.5","node_port":"9701","services":["VALIDATOR"]},"dest":"GVvdyd7Y6hsBEy5yDDHjqkXgH8zW34K74RsxUiUCZDCE"},"metadata":{"from":"V5qJo72nMeF7x3ci8Zv2WP"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fe991cd590fff10f596bb6fe2362229de47d49dd50748e38b96f368152be29c7"},"ver":"1"}',
  });

const DEFAULT_LIBINDY_DID = 'LibindyDid211111111111';

const buildTx = (ledger, number): any => ({
  operation: {
    type: type.GET_TXN,
    ledgerId: ledgerType[ledger], // domain ledger
    data: number, // transaction number
  },
  identifier: DEFAULT_LIBINDY_DID, // sender did
  protocolVersion: 2,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function setCb(cb) {
  globalCb = cb;
}

function getVal(ledger, index): any {
  return db[ledger][index];
}

export async function queryPage(
  ledger: 'POOL' | 'DOMAIN' | 'CONFIG',
  index = 1,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // const page = index;
    const foundationBuilderNode = getIndy();
    while (true) {
      if (String(getVal(ledger, index)) !== 'undefined') break;

      let current;
      try {
        current = await foundationBuilderNode.send(buildTx(ledger, index));
      } catch (e) {
        if (e.message.indexOf('smaller than 1')) {
          index++;
          continue;
        }
        return reject(e);
      }

      if (!current.result.data) break;

      (db[ledger] as any)[index] = current.result.data;
      index++;
    }
    resolve();
    foundationBuilderNode.close();
  });
}

export async function watch(
  ledger: 'POOL' | 'DOMAIN' | 'CONFIG',
  blockNumber: number,
  period = 2000,
): Promise<void> {
  const foundationBuilderNode = getIndy();

  while (true) {
    const current = await foundationBuilderNode.send(
      buildTx(ledger, blockNumber),
    );
    if (!current.result.data) {
      setTimeout(() => {
        watch(ledger, blockNumber);
      }, period);
      break;
    }

    (db[ledger] as any)[blockNumber] = current;
    globalCb(ledger, current);
  }
  foundationBuilderNode.close();
}

const defaultSizes = {
  POOL: 40,
  DOMAIN: 500,
  CONFIG: 177,
};

async function definePoolSizes(): Promise<{ [key: string]: number }> {
  const r = {};
  const indy = await getIndy();
  for (const ledger of ledgers) {
    const tx = buildTx(ledger, 1);
    const resp = await indy.send(tx);
    r[ledger] = resp?.result?.data?.ledgerSize || defaultSizes[ledger];
  }
  return r;
}

//const FACTOR = 0.1;

export class PoolerService {
  public async Init(): Promise<void> {
    console.time('LoadLedger');

    const poolSizes = await definePoolSizes();

    const int = setInterval(() => {
      console.log(
        `Loaded DOMAIN: [${parseFloat(
          (
            (db.DOMAIN.filter((tx: any) => tx).length / poolSizes['DOMAIN']) *
            100
          ).toString(),
        ).toFixed(2)}%], POOL: [${parseFloat(
          (
            (db.POOL.filter((tx: any) => tx).length / poolSizes['POOL']) *
            100
          ).toString(),
        ).toFixed(2)}%] and CONFIG: [${parseFloat(
          (
            (db.CONFIG.filter((tx: any) => tx).length / poolSizes['CONFIG']) *
            100
          ).toString(),
        ).toFixed(2)}%]. ${sizeof(db.DOMAIN)}`,
      );
    }, 2000);

    await Promise.all([
      ...buildPromises(
        (n) => queryPage('POOL', n),
        poolSizes['POOL'],
        Math.ceil(poolSizes['POOL'] * 0.5),
      ),
      ...buildPromises(
        (n) => queryPage('CONFIG', n),
        poolSizes['CONFIG'],
        Math.ceil(poolSizes['CONFIG'] * 0.07),
      ),
      ...buildPromises(
        (n) => queryPage('DOMAIN', n),
        poolSizes['DOMAIN'],
        Math.ceil(poolSizes['DOMAIN'] * 0.01),
      ),
    ]);

    clearInterval(int);

    console.timeEnd('LoadLedger');

    watch('DOMAIN', db.DOMAIN.length, 2000);
    watch('POOL', db.POOL.length, 2000);
    watch('CONFIG', db.CONFIG.length, 2000);
  }
}
