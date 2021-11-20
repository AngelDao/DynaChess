import { useRef, useState, useEffect } from "react";
import Chess from "chess.js";
import styled from "styled-components";
import { Chessboard } from "react-chessboard";
import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";
import { save_moves, read_moves } from "./_aqua/moves";

// TESTNET
// const streamId =
//   "kjzl6cwe1jw149pgumj6277cq1dondtbjco3syf945lgivi747tlrdotfki46ez";

// // MAINNET
// const streamId =
//   "kjzl6cwe1jw1486dfqnalcql6ar92q6tx9nycvw57pzxhl2nsoajbnzxeg1cmly";

const PlayVsPlay = ({
  game,
  setGame,
  chessboardRef,
  relayNode,
  relayPeerId,
  peerId,
  connectedFluence,
  streamId,
}) => {
  const [gameHistory, setGameHistory] = useState([]);

  async function sendToFluenceNode() {
    if (
      !connectedFluence ||
      !connectedFluence.getStatus() ||
      !connectedFluence.getStatus().isConnected
    ) {
      return;
    }
    // console.log("Sending game", gameHistory, streamId);
    const myJson = JSON.stringify({ moves: gameHistory });
    // const res = await generate_doc(relayPeerId, peerId, myJson);
    // console.log(res);
    console.log("try to save moves");
    const saveRes = await save_moves(relayPeerId, peerId, myJson, streamId);
    const movesRes = await read_moves(relayPeerId, peerId, streamId);
    console.log("Saved Moves", movesRes);
  }

  useEffect(() => {
    sendToFluenceNode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameHistory]);

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    const history = game.history();
    setGameHistory(history);
    setGame(gameCopy);
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
      <p style={{ marginTop: "10px", marginBottom: "5px" }}>
        Ceramic Game Hash
      </p>
      {/* <MoveContainer>{moves()}</MoveContainer> */}
      <MoveContainer>{streamId}</MoveContainer>
    </div>
  );
};

const MoveContainer = styled.div`
  border-radius: 3px;
  background: #666;
  padding: 10px;
  font-size: 0.9rem;
  max-width: 480px;
  // padding-top: 5px;
`;

export default PlayVsPlay;
