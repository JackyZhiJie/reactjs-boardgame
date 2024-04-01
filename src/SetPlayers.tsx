import React, { useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

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
    <Grid container direction="column" spacing={2} alignContent={"center"}>
      <Grid item xs={12} md={12}>
        <h1>Pretty Chinese</h1>
        <p>Start game by entering the names of Player 1 and Player 2</p>
      </Grid>
      <Grid container item spacing={2}>
        <Grid item xs={12} sm={6} md={6}>
          <TextField fullWidth variant="outlined" placeholder="Player 1 Name" value={player1Name} onChange={handlePlayer1NameChange} />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField fullWidth variant="outlined" placeholder="Player 2 Name" value={player2Name} onChange={handlePlayer2NameChange} />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" fullWidth disabled={!player1Name || !player2Name} onClick={handleClick}>
          START
        </Button>
      </Grid>
    </Grid>
  );
};
