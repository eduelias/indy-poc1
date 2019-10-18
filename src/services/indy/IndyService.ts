import { ConfigSchema } from '../ConfigService';
import { PoolService } from '../PoolService';
import { IndyActor } from '@model/indy/Actor';
import { IndyDid } from '@model/indy/Did';
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

    this.logger.debug('Pool open.');
  }

  public async getPool(): Promise<any> {
    if (!this.poolHandle) {
      await this.openPool();
    }
    return this.poolHandle;
  }

  public async createWallet(settings: {
    id: string;
    key: string;
  }): Promise<any> {
    try {
      await indy.createWallet({ id: settings.id }, { key: settings.key });
    } catch (e) {
      if (e.message !== 'WalletAlreadyExistsError') {
        this.logger.trace(e);
        throw e;
      }
    }
  }

  public async openWallet(settings: { id: string; key: string }): Promise<any> {
    return await indy.openWallet({ id: settings.id }, { key: settings.key });
  }

  public async createAndStoreDid(wallet: any, info: any): Promise<any> {
    return await indy.createAndStoreMyDid(wallet, info);
  }

  public async sendNym(
    poolHandle: any,
    fromActor: IndyActor,
    newDid: IndyDid,
    role?: string,
  ): Promise<IndyService> {
    if (!fromActor.did) throw new Error('Invalid actor did.');

    // onboarding(
    //   poolHandle,
    //   'Sovrin Steward',
    //   stewardWallet,
    //   stewardDid,
    //   'Government',
    //   null,
    //   governmentWalletConfig,
    //   governmentWalletCredentials,
    // );

    // sendNym(poolHandle, fromWallet, fromDid, fromToDid, fromToKey, null)

    // sendNym(poolHandle, walletHandle, Did, newDid, newKey, role)
    // buildNymRequest(Did, newDid, newKey, null, role)
    // signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest)

    const nymRequest = await indy.buildNymRequest(
      fromActor.did.did,
      newDid.did,
      newDid.key,
      null,
      role,
    );
    await indy.signAndSubmitRequest(
      poolHandle,
      fromActor.wallet,
      fromActor.did.did,
      nymRequest,
    );
    return this;
  }

  public async sendSchema(
    poolHandle: number,
    walletHandle: number,
    Did: string,
    schema: string,
  ): Promise<IndyService> {
    // schema = JSON.stringify(schema); // FIXME: Check JSON parsing
    const schemaRequest = await indy.buildSchemaRequest(Did, schema);
    await indy.signAndSubmitRequest(
      poolHandle,
      walletHandle,
      Did,
      schemaRequest,
    );
    return this;
  }

  public async sendCredDef(
    poolHandle: number,
    walletHandle: number,
    did: string,
    credDef: string,
  ): Promise<IndyService> {
    const credDefRequest = await indy.buildCredDefRequest(did, credDef);
    await indy.signAndSubmitRequest(
      poolHandle,
      walletHandle,
      did,
      credDefRequest,
    );
    return this;
  }

  public async getSchema(
    poolHandle: number,
    did: string,
    schemaId: string,
  ): Promise<any> {
    const getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    const getSchemaResponse = await indy.submitRequest(
      poolHandle,
      getSchemaRequest,
    );
    return await indy.parseGetSchemaResponse(getSchemaResponse);
  }

  public async getCredDef(
    poolHandle: number,
    did: string,
    schemaId: string,
  ): Promise<any> {
    const getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    const getCredDefResponse = await indy.submitRequest(
      poolHandle,
      getCredDefRequest,
    );
    return await indy.parseGetCredDefResponse(getCredDefResponse);
  }
}
