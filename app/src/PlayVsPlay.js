import { useRef, useState, useEffect } from "react";
import Chess from "chess.js";
import styled from "styled-components";
import { Chessboard } from "react-chessboard";
import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { save_moves, read_moves, read_info, generateDoc } from "./_aqua/moves";

const relayNode =
  "/dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e";
const peerId = "12D3KooWAezpEg6WEWggYuip2pTJrFYLeq5r9E8JeBJ3kf9zhSha";
const relayPeerId = "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e";
const ceramicId = "https://gateway.ceramic.network";

export default function PlayVsPlay() {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess());
  const [gameHistory, setGameHistory] = useState([]);
  // const [ceramicId, setCeramicId] = useState("");
  const [connectedFluence, setFluence] = useState();

  // console.log("Game", game.history())

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function moves() {
    const history = game.history();
    let moves = "";
    let moveCounter = 0;
    for (var i = 0; i < history.length; i++) {
      if (i % 2) {
        moves += " " + history[i];
      } else {
        moveCounter++;
        moves += " " + moveCounter + ". " + history[i];
      }
    }
    if (moves.length == 0) {
      moves = "Play a move!";
    }
    return moves;
  }

  async function sendToFluenceNode() {
    if (!connectedFluence.getStatus().isConnected) {
      return;
    }
    console.log("Sending game", gameHistory, ceramicId);

    const myJson = JSON.stringify({ moves: gameHistory });
    // console.log(save_moves);
    // const saveRes = await save_moves(relayPeerId, peerId, myJson, ceramicId);
    // const res = await read_info(relayPeerId, peerId);
    console.log(typeof myJson);
    console.log(myJson);
    const res2 = await generateDoc(relayPeerId, peerId, myJson);
    const res3 = await read_info(relayPeerId, peerId);
    debugger;
    const saveRes = await save_moves(relayPeerId, peerId, myJson, ceramicId);
    console.log("save game", saveRes);
  }

  const connectFluence = async () => {
    await Fluence.start({ connectTo: relayNode }).catch((err) =>
      console.log("Client initialization failed", err)
    );
    console.log("Fluence connected", Fluence.getStatus().isConnected);
    console.log(Fluence);
    return Fluence;
  };

  useEffect(() => {
    (async () => {
      if (!connectedFluence) {
        const res = await connectFluence();
        setFluence(res);
      }
    })();
  });

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    const history = game.history();
    setGameHistory(history);
    console.log("History", history);
    setGame(gameCopy);
    sendToFluenceNode();
    return move;
  }

  return (
    <div>
      <Chessboard
        id="PlayVsPlay"
        animationDuration={200}
        showBoardNotation={true}
        boardWidth={500}
        position={game.fen()}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
        }}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          // setCeramicId("");
          safeGameMutate((game) => {
            game.reset();
          });
          chessboardRef.current.clearPremoves();
        }}
      >
        New Game
      </button>
      <p>Algebraic notation</p>
      <MoveContainer>{moves()}</MoveContainer>
      <button className="rc-button">View Dynamic NFT metadata</button>
    </div>
  );
}

const MoveContainer = styled.div`
  border-radius: 3px;
  background: #666;
  padding: 10px;
  font-size: 0.9rem;
  max-width: 480px;
`;
