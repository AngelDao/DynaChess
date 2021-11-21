import React, { useState, useRef, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Chess from "chess.js";
import PlayVsPlay from "./PlayVsPlay";
import Modal from "./Modal";
import { generate_doc, read_moves, read_info } from "./_aqua/moves";
import { Fluence } from "@fluencelabs/fluence";

const relayNode =
  "/dns4/kras-00.fluence.dev/tcp/19990/wss/p2p/12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e";
const peerId = "12D3KooWFCY8xqebtZqNeiA5took71bUNAedzCCDuCuM1QTdTbWT";
const relayPeerId = "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e";

function App() {
  const [hash, setHash] = useState("");
  const [game, setGame] = useState(new Chess());
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    initializeTX: "",
  });
  const [streamId, setStreamId] = useState(null);
  const chessboardRef = useRef();
  const [connectedFluence, setFluence] = useState();

  const switchModal = () => {
    setVisibleModal(!visibleModal);
  };

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  const closeModal = () => {
    setVisibleModal(false);
    setModalContent({ title: "", content: "" });
    resetHash();
  };

  const resetHash = () => {
    setHash("");
  };

  const anyOpen = () => {
    if (visibleModal) {
      return true;
    }
    return false;
  };

  function moves(m) {
    // const history = game.history();
    const history = m;
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
    if (moves.length === 0) {
      moves = "Play a move!";
    }
    return moves;
  }

  const newGame = async () => {
    console.log("create new stream hash");
    const initialJson = JSON.stringify({ moves: [] });
    const res = await generate_doc(relayPeerId, peerId, initialJson);
    localStorage.setItem("streamId", res);
    localStorage.setItem("oldStreamId", streamId);
    setStreamId(res);
    safeGameMutate((game) => {
      game.reset();
    });
    chessboardRef.current.clearPremoves();
    closeModal();
  };

  const loadGame = async (id) => {
    const savedmoves = await read_moves(relayPeerId, peerId, hash);
    const localStream = localStorage.getItem("streamId");
    localStorage.setItem("streamId", hash);
    localStorage.setItem("oldStreamId", localStream);
    game.load_pgn(moves(savedmoves.moves));
    setStreamId(hash);
    closeModal();
  };

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
        console.log("connected fluence");
        const res = await connectFluence();
        setFluence(res);
      }
    })();
  });

  useEffect(() => {
    (async () => {
      const localStream = localStorage.getItem("streamId");
      console.log("check stream hash");
      if (!streamId && !localStream) {
        console.log("create new stream hash");
        const initialJson = JSON.stringify({ moves: [] });
        const res = await generate_doc(relayPeerId, peerId, initialJson);
        localStorage.setItem("streamId", res);
        setStreamId(res);
      }
      if (localStream && !streamId) {
        console.log("check existing hash");
        try {
          await read_info(relayPeerId, peerId, localStream);
          const savedmoves = await read_moves(relayPeerId, peerId, localStream);
          if (savedmoves.moves.length > 0) {
            game.load_pgn(moves(savedmoves.moves));
          }
          setStreamId(localStream);
        } catch {
          const initialJson = JSON.stringify({ moves: [] });
          const res = await generate_doc(relayPeerId, peerId, initialJson);
          localStorage.setItem("streamId", res);
          setStreamId(res);
        }
      }
    })();
  }, [connectedFluence]);

  return (
    <div className="App">
      <Modal
        title={modalContent.title}
        content={modalContent.content}
        visible={visibleModal}
        handleClose={switchModal}
        newGame={newGame}
        loadGame={loadGame}
        hash={hash}
        setHash={setHash}
      />
      <div
        onClick={() => {
          closeModal();
        }}
        style={{
          position: "absolute",
          zIndex: anyOpen() ? "3" : "7",
          width: "100%",
          height: "100%",
          display: !anyOpen() && "none",
          backgroundColor: visibleModal && "rgba(0,0,0,0.5)",
        }}
      />
      <header className="App-header">
        <div style={{ width: "500px" }}>
          <p style={{ marginTop: "10px" }}>DynaChess</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "10px",
            }}
          >
            <button
              className="rc-button"
              onClick={() => {
                setModalContent({
                  title: "New Game",
                  content: "Are you sure you want to gen a new game?",
                });
                switchModal();
              }}
            >
              New Game
            </button>
            <button
              className="rc-button"
              onClick={() => {
                setModalContent({
                  title: "Load Game",
                  content:
                    "Input the stream hash of the game you wish to load, check console for errors of bad hashes",
                });
                switchModal();
              }}
            >
              Load Game
            </button>
            <button className="rc-button">View Dynamic NFT metadata</button>
          </div>
        </div>
        <PlayVsPlay
          connectedFluence={connectedFluence}
          relayNode={relayNode}
          peerId={peerId}
          relayPeerId={relayPeerId}
          chessboardRef={chessboardRef}
          game={game}
          setGame={setGame}
          boardWidth="500"
          streamId={streamId}
        />
      </header>
    </div>
  );
}

export default App;
