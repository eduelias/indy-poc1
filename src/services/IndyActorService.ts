import { IndyService } from './IndyService';

export class IndyActorService {
  private wallet: any;
  private did?: { did: string; key: string } = undefined;
  /**
   *
   */
  constructor(
    public id: string,
    public key: string,
    public seed: string,
    private indyService: IndyService,
    private logger: Console,
  ) {}

  public async createWallet(): Promise<void> {
    await this.indyService.createWallet(this);
  }

  public async openWallet(): Promise<any> {
    this.wallet = await this.indyService.openWallet(this);
    return this.wallet;
  }

  public async createAndStoreDid(): Promise<any> {
    if (!this.wallet) {
      await this.openWallet();
    }

    const [did, key] = await this.indyService.createAndStoreDid(this.wallet, {
      seed: this.seed,
    });

    this.did = {
      did,
      key,
    };

    this.logger.debug(this.did);
  }
}
