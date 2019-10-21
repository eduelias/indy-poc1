import { IndyDid } from '@Model/Indy/Did';

export class IndyActor {
  public did?: IndyDid;
  public wallet?: number;
  /**
   *
   */
  constructor(
    public name: string,
    public id: string,
    public key: string,
    public seed: string,
  ) {}
}
