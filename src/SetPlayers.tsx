import React, { useState } from "react";
import Button from "@mui/material/Button";

interface SetPlayersProps {
  updateNumberOfPlayers: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showLayout: () => void;
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string) => void;
}

export const SetPlayers: React.FC<SetPlayersProps> = (props) => {
  const { updateNumberOfPlayers, showLayout, setPlayer1Name, setPlayer2Name } = props;
  const [player1Name, setPlayer1NameLocal] = useState("");
  const [player2Name, setPlayer2NameLocal] = useState("");

  const handlePlayer1NameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer1NameLocal(e.target.value);
    setPlayer1Name(e.target.value);
  };

  const handlePlayer2NameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer2NameLocal(e.target.value);
    setPlayer2Name(e.target.value);
  };

  const handleClick = () => {
    //alert(`Player 1: ${player1Name}, Player 2: ${player2Name}`);
    showLayout();
  };

  return (
    <div>
      <p>Start game by entering the names of Player 1 and Player 2</p>
      <div>
        <input type="text" placeholder="Player 1 Name" value={player1Name} onChange={handlePlayer1NameChange} />
        <br />
        <input type="text" placeholder="Player 2 Name" value={player2Name} onChange={handlePlayer2NameChange} />
        <br />
        <Button variant="contained" className="m-l-20" disabled={!player1Name || !player2Name} onClick={handleClick}>
          START
        </Button>
      </div>
    </div>
  );
};
