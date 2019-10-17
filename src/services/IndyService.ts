import { ConfigSchema } from './ConfigService';
import { PoolService } from './PoolService';
import indy from 'indy-sdk';

export class IndyService {
  private poolHandle: any;
  /**
   *
   */
  constructor(
    private config: ConfigSchema,
    private poolService: PoolService,
    private logger: Console,
  ) {}

  private async openPool(): Promise<any> {
    try {
      const data = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        genesis_txn: await this.poolService.getPoolGenesisTxnPath(
          this.config.poolName,
        ),
      };
      await indy.createPoolLedgerConfig(this.config.poolName, data);
    } catch (e) {
      if (e.message !== 'PoolLedgerConfigAlreadyExistsError') {
        throw e;
      }
    }

    await indy.setProtocolVersion(2);

    this.poolHandle = await indy.openPoolLedger(this.config.poolName);

    this.logger.trace('Pool open.');
  }

  public async getPool(): Promise<any> {
    if (!this.poolHandle) {
      await this.openPool();
    }
    return this.poolHandle;
  }
}
