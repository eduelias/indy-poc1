import { IndyDidService } from './DidService';
import { IndyActor } from '@model/indy/Actor';
import indy from 'indy-sdk';

export class IndyStewardService extends IndyDidService {
  public async onboard(
    poolHandle: any,
    fromActor: IndyActor,
    toActor: IndyActor,
  ): Promise<any> {
    this.log.log(
      `\"${fromActor.name}\" > Create and store in Wallet \"${fromActor.name} ${toActor.name}\" DID`,
    );
    const fromToDid = await this.createAndStoreDid(fromActor, {});

    this.log.log(
      `\"${fromActor.name}\" > Send Nym to Ledger for \"${fromActor.name} ${toActor.name}\" DID`,
    );
    await this.indyService.sendNym(poolHandle, fromActor, fromToDid);

    this.log.log(
      `\"${fromActor.name}\" > Send connection request to ${toActor.name} with \"${fromActor.name} ${toActor.name}\" DID and nonce`,
    );

    const connectionRequest = {
      did: fromToDid.did,
      nonce: 123456789,
    };

    const toFromDid = await this.createAndStoreDid(toActor, {});

    this.log.log(
      `\"${toActor.name}\" > Get key for did from \"${fromActor.name}\" connection request`,
    );
    const fromToVerkey = await indy.keyForDid(
      poolHandle,
      toActor.wallet,
      connectionRequest.did,
    );

    this.log.log(
      `\"${toActor.name}\" > Anoncrypt connection response for \"${fromActor.name}\" with \"${toActor.name} ${fromActor.name}\" DID, verkey and nonce`,
    );
    const connectionResponse = JSON.stringify({
      did: toFromDid.did,
      verkey: toFromDid.key,
      nonce: connectionRequest['nonce'],
    });

    const anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(
      fromToVerkey,
      Buffer.from(connectionResponse, 'utf8'),
    );

    this.log.log(
      `\"${toActor.name}\" > Send anoncrypted connection response to \"${fromActor.name}\"`,
    );

    this.log.log(
      `\"${fromActor.name}\" > Anondecrypt connection response from \"${toActor.name}\"`,
    );
    const decryptedConnectionResponse = JSON.parse(
      Buffer.from(
        await indy.cryptoAnonDecrypt(
          fromActor.wallet,
          fromToDid.key,
          anoncryptedConnectionResponse,
        ),
      ).toString(),
    );

    this.log.log(
      `\"${fromActor.name}\" > Authenticates \"${toActor.name}\" by comparision of Nonce`,
    );
    if (connectionRequest['nonce'] !== decryptedConnectionResponse['nonce']) {
      throw Error("nonces don't match!");
    }

    this.log.log(
      `\"${fromActor.name}\" > Send Nym to Ledger for \"${toActor.name} ${fromActor.name}\" DID`,
    );
    await this.indyService.sendNym(poolHandle, fromActor, {
      did: decryptedConnectionResponse['did'],
      key: decryptedConnectionResponse['verkey'],
    });

    return [toActor.wallet, fromToDid, toFromDid, decryptedConnectionResponse];
  }
}
