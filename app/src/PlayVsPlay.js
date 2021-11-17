import { useRef, useState } from 'react';
import Chess from 'chess.js';
import styled from 'styled-components'
import { Chessboard } from 'react-chessboard';
import { Fluence } from "@fluencelabs/fluence";
import { krasnodar } from "@fluencelabs/fluence-network-environment";



export default function PlayVsPlay() {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess());
  const [ceramicId, setCeramicId] = useState("");

  // console.log("Game", game.history())

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function moves(){
    const history = game.history();
    let moves = "";
    let moveCounter = 0; 
    for (var i=0; i<history.length; i++){
      if (i % 2){
        moves += " "+history[i]
      } else {
        moveCounter++;
        moves += " "+moveCounter+". "+history[i]

      }
    }
    if (moves.length ==0){
      moves = "Play a move!"
    }
    return moves
  }

  async function createNewMetadata() {

  }

  
  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' 
    });
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
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
          chessboardRef.current.clearPremoves();
          createNewMetadata();
        }}
      >
        New Game
      </button>
      <p>Algebraic notation</p>
      <MoveContainer>{moves()}</MoveContainer>
      <button
        className="rc-button"
      >
        View Dynamic NFT metadata
      </button>
    </div>
  );
}


const MoveContainer = styled.div`
 border-radius: 3px;
 background:#666;
 padding:10px;
 font-size:0.9rem;
 max-width:480px;
`
