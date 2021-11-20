// @ts-nocheck
// /\ unfortunately this is needed to use ceramic...
import { Fluence, KeyPair } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { registerMoveSaver, MoveSaverDef } from "./_aqua/moves";
import CeramicClient from '@ceramicnetwork/http-client'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { randomBytes } from '@stablelib/random'
import { TileDocument } from '@ceramicnetwork/stream-tile';
import KeyResolver from 'key-did-resolver'
import ThreeIDResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'
import {ethers} from "ethers"

// write/read node for ceramic testnet
(async () => {
  // TESTNET
const API_URL = 'https://ceramic-clay.3boxlabs.com';
// // MAINNET
// const API_URL = 'https://gateway.ceramic.network';
const ceramic = new CeramicClient(API_URL);
const seed = new Uint8Array([
  134, 221,  59, 223, 109,  42,  34,  45,
   76, 248, 139, 215,   1,   7, 229, 150,
   40, 193, 146,  99,   5,   6,   3,  52,
  123, 139,  77, 159,  58, 195,  20, 151
]);
const provider = new Ed25519Provider(seed);
const keyResolver = KeyResolver.getResolver();
console.log(seed)
console.log(provider)
const resolverRegistry = {...keyResolver, ...ThreeIDResolver.getResolver(ceramic)};
console.log(resolverRegistry)
const did = new DID({ provider, resolver: resolverRegistry });
await did.authenticate();
await ceramic.setDID(did); 
await ceramic.did.setProvider(provider);


interface SaveResult {
  ceramicId: string;
  msg:string;
}

interface ReadResult {
  moves: Array<string>
}

class MoveSaver implements MoveSaverDef {

  async readDoc(id){
    const stream = await ceramic.loadStream(id)
    console.log(stream)
    console.log(stream.content)
    return 'info'
  }
  
  async generateDoc(move_json) {
      const doc = await TileDocument.create(
        ceramic,
        {"foo" : "bar"}
      );
      const id  = doc.id.toString();
      let result = {} as SaveResult;
      result.ceramicId = id;
      return result.ceramicId;
  }
    
    
    async saveMoves(move_json: string, streamId: string): Promise<SaveResult> {
      if (streamId){
        console.log(streamId)
        const doc = await TileDocument.load(ceramic, streamId);
        await doc.update(JSON.parse(move_json));
        console.log("updated")
        let result = {} as SaveResult;
        result.ceramicId = streamId
        result.msg = "success";
        return result;
      }else {
        let result = {} as SaveResult;
        result.ceramicId = "";
        result.msg = "failed"
        return result
      }
    }
    async readMoves(streamId: string): Promise<ReadResult> {
      console.log(streamId)
      const stream = await ceramic.loadStream(streamId)
      console.log(stream)
      let result = {} as ReadResult;
      console.log("Doc Content: ", stream.content)
      result.moves = stream.content.moves;
      return result;
    }
  }
  
  async function main() {
    const SecretKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    const skBytes: Uint8Array = ethers.utils.arrayify(SecretKey);
    await Fluence.start({
      connectTo: krasnodar[0],
      KeyPair: await KeyPair.fromEd25519SK(skBytes)
    });
    registerMoveSaver(new MoveSaver());
    console.log("application started", Fluence.getStatus());
    console.log("peer id is: ", Fluence.getStatus().peerId);
    console.log("relay is: ", Fluence.getStatus().relayPeerId);
  }
  
  main();
})()
