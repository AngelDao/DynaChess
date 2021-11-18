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

interface SaveResult {
  ceramicId: string;
}

interface ReadResult {
  moves: Array<string>
}

class MoveSaver implements MoveSaverDef {
  async saveMoves(move_json: string, ceramicId: string): Promise<SaveResult> {
    if (ceramicId && ceramicId.length > 0){
      const doc = await TileDocument.load(ceramic, ceramicId);
      await doc.update(JSON.parse(move_json));

      let result = {} as SaveResult;
      result.ceramicId = ceramicId;

      return result;
    } else {
      const doc = await TileDocument.create(
        ceramic,
        JSON.parse(move_json)
      );

      const streamId = doc.id.toString();

      let result = {} as SaveResult;
      result.ceramicId = streamId;

      return result;
    }
  }
  async readMoves(ceramicId: string): Promise<ReadResult> {
    const doc = await TileDocument.load(ceramic, ceramicId);

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