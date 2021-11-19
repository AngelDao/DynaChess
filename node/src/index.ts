// @ts-nocheck
// /\ unfortunately this is needed to use ceramic...
import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { registerMoveSaver, MoveSaverDef } from "./_aqua/moves";
import CeramicClient from '@ceramicnetwork/http-client'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { randomBytes } from '@stablelib/random'
import { TileDocument } from '@ceramicnetwork/stream-tile';
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { DID } from 'dids'

// write/read node for ceramic testnet
// const API_URL = 'https://ceramic-clay.3boxlabs.com'
// const ceramic = new CeramicClient(API_URL)
// const seed = randomBytes(32)
// const provider = new Ed25519Provider(seed)
// const did = new DID({ provider, resolver: KeyDidResolver.getResolver() })
// ceramic.did = did
// ceramic.did.setProvider(provider)

console.log(TileDocument)

interface SaveResult {
  ceramicId: string;
  doc: any;
  msg: string;
}

interface ReadResult {
  moves: Array<string>
}

interface ConfigInfo {
  doc: any;
  id: any;
}

class MoveSaver implements MoveSaverDef {
  constructor(){
    this.doc = null;
    this.id = null;
  }
  
  readInfo() {
    return [this.doc, this.id ]
  }
  
  async generateDoc(move_json) {
    const API_URL = 'https://gateway.ceramic.network'
    const ceramic = new CeramicClient(API_URL)
    const seed = randomBytes(32)
    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: KeyDidResolver.getResolver() })
    ceramic.did = did
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    
    const doc = await TileDocument.create(
      ceramic,
      JSON.parse(move_json)
    );
    const id  = doc.id.toString();
    let result = {} as SaveResult;
    result.ceramicId = id;
    result.doc = doc;
    result.msg = "success";
    return result;
  }
    
    
    async saveMoves(move_json: string): Promise<SaveResult> {
      const ceramic = new CeramicClient(API_URL)
      const provider = new Ed25519Provider(seed)
      ceramic.did.setProvider(provider)
      await ceramic.did.authenticate()
      
      
      if (this.id && this.id.length > 0){
        const doc = await TileDocument.load(ceramic, this.id);
        await doc.update(JSON.parse(move_json));
        let result = {} as SaveResult;
        result.msg = "success";
        return result;
      }else {
        await this.generateDoc();
        let result = {} as SaveResult;
        result.msg = "success";
        return result
      }
    }
    async readMoves(): Promise<ReadResult> {
      const ceramic = new CeramicClient(API_URL)
      const provider = new Ed25519Provider(seed)
      ceramic.did.setProvider(provider)
      await ceramic.did.authenticate()
      
      const doc = await TileDocument.load(ceramic, this.id);
      let result = {} as ReadResult;
      console.log("Doc Content: ", doc.content)
      result.moves = doc.content.moves;
      return result;
    }
  }
  
  async function main() {
    await Fluence.start({
      connectTo: krasnodar[0],
    });
    registerMoveSaver(new MoveSaver());
    console.log("application started", Fluence.getStatus());
    console.log("peer id is: ", Fluence.getStatus().peerId);
    console.log("relay is: ", Fluence.getStatus().relayPeerId);
  }
  
  main();