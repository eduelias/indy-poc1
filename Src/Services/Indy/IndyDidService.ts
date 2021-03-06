import { IndyActor } from '@Model/Indy/Actor';
import { IndyDid } from '@Model/Indy/Did';
import { IndyService } from '@Services/Indy/IndyService';

export class IndyDidService {
  /**
   *
   */
  constructor(protected indyService: IndyService, protected log: Console) {}

  public async openWallet(actor: IndyActor): Promise<IndyDidService> {
    if (!actor.wallet) {
      await this.indyService.createWallet(actor);
      try {
        actor.wallet = await this.indyService.openWallet(actor);
      } catch (e) {
        if (e.message !== 'WalletAlreadyOpenedError') {
          throw e;
        }
      }
    }
    return this;
  }

  public async createAndStoreDid(
    actor: IndyActor,
    meta: any,
  ): Promise<IndyDid> {
    if (!actor.wallet) {
      await this.openWallet(actor);
    }

    const [did, key] = await this.indyService.createAndStoreDid(
      actor.wallet,
      meta,
    );

    return new IndyDid(did, key);
  }
}
