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
const API_URL = 'https://ceramic-clay.3boxlabs.com'
const ceramic = new CeramicClient(API_URL)
const resolver = { ...KeyDidResolver.getResolver(),
                   ...ThreeIdResolver.getResolver(ceramic) }
const did = new DID({ resolver })
ceramic.did = did

console.log(ceramic)

interface SaveResult {
  ceramicId: string;
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
  constructor(c){
    this.ceramic = c
    this.doc = null;
    this.id = null;
  }

  readInfo() {
    return [this.doc, this.id ]
  }

  async generateDoc(move_json: string) {
    this.doc = await TileDocument.create(
      this.ceramic,
      JSON.parse(move_json)
    );
    this.id = this.doc.id.toString()
    let result = {} as SaveResult;
    result.msg = "success";
    return result
  }


  async saveMoves(move_json: string): Promise<SaveResult> {
    if (this.id && this.id.length > 0){
      const doc = await TileDocument.load(this.ceramic, this.id);
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
    const doc = await TileDocument.load(this.ceramic, this.id);
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
  registerMoveSaver(new MoveSaver(ceramic));
  console.log("application started", Fluence.getStatus());
  console.log("peer id is: ", Fluence.getStatus().peerId);
  console.log("relay is: ", Fluence.getStatus().relayPeerId);
}

main();