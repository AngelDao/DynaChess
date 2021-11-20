import React, { useState } from "react";
import Close from "./assets/close.png";

const Modal = ({
  title,
  content,
  handleClose,
  visible,
  newGame,
  loadGame,
  hash,
  setHash,
}) => {
  if (!visible) {
    return null;
  }

  let onConfirm;

  switch (title) {
    case "New Game":
      onConfirm = newGame;
      break;
    case "Load Game":
      onConfirm = loadGame;
      break;
    default:
      onConfirm = handleClose;
  }

  const handleChange = (e) => {
    setHash(e.target.value);
    console.log("value of hash", hash);
  };

  return (
    <div
      style={{
        color: "white",
        width: "100%",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          zIndex: "8",
          width: "600px",
          height: "250px",
          background: "rgb(72 80 94)",
          //   borderRadius: "20px",
          border: "1px solid black",
          padding: "30px",
          position: "relative",
        }}
      >
        <img
          onClick={() => handleClose()}
          style={{
            width: "15px",
            position: "absolute",
            right: "20px",
            top: "35px",
            cursor: "pointer",
          }}
          src={Close}
          alt="x"
        />
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "25px" }}>{title}</span>
          <span style={{ marginTop: "50px", textAlign: "center" }}>
            {content}
          </span>
          {title === "Load Game" && (
            <div style={{ marginTop: "20px", width: "100%" }}>
              <input
                value={hash}
                onChange={(e) => {
                  handleChange(e);
                }}
                style={{ width: "80%" }}
              />
            </div>
          )}
          <div
            style={{
              width: "100%",
              //   position: "absolute",
              bottom: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={onConfirm}
              style={{
                width: "30%",
                marginTop: "50px",
                border: "2px solid black",
                height: "25px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              <span>Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
