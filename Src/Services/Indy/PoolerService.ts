import { IndyReq, ledger, type } from './Explorer';

export async function queryForTx(
  cb: (data: any) => void,
  counter = 1,
): Promise<void> {
  const foundationBuilderNode = IndyReq({
    // builderNet,  first line from: https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_builder_genesis
    genesisTxn:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"127.0.0.1","client_port":9702,"node_ip":"127.0.0.1","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}',
  });

  const DEFAULT_LIBINDY_DID = 'LibindyDid111111111111';

  const getTxn = (number): any => ({
    operation: {
      type: type.GET_TXN,
      ledgerId: ledger.DOMAIN, // domain ledger
      data: number, // transaction number
    },
    identifier: DEFAULT_LIBINDY_DID, // sender did
    protocolVersion: 2,
  });

  // get transaction
  while (true) {
    const current = await foundationBuilderNode.send(getTxn(counter));
    if (!current.result.data) {
      setTimeout(() => {
        queryForTx(cb, counter);
      }, 2000);
      break;
    }
    cb(current);
    counter++;
  }

  foundationBuilderNode.close();
}
