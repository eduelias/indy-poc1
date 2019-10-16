/* tslint:disable */
/* eslint-disable */
interface Config {
  genesisTxn: GenesisTxn[];
}
interface GenesisTxn {
  reqSignature: ReqSignature;
  txn: Txn;
  txnMetadata: TxnMetadata;
  ver: string;
}
interface TxnMetadata {
  seqNo: number;
  txnId: string;
}
interface Txn {
  data: Data2;
  metadata: Metadata;
  type: string;
}
interface Metadata {
  from: string;
}
interface Data2 {
  data: Data;
  dest: string;
}
interface Data {
  alias: string;
  blskey: string;
  blskey_pop: string;
  client_ip: string;
  client_port: number;
  node_ip: string;
  node_port: number;
  services: string[];
}
interface ReqSignature {
}