import React, { useState } from "react";
import "./styles.css";
import { SetPlayers } from "./SetPlayers.tsx";
import { Layout } from "./Layout";
import { Ledger } from "./Ledger.tsx";
import Dice from "./Dice.tsx";
import Grid from "@mui/material/Grid";
import { Container } from "@mui/material";
import HandWriting from "./HandWriting";

class App extends React.Component {
  //constructor means initializing the state
  constructor(props) {
    super(props);
    this.state = {
      numOfPlayers: 2,
      hidePlayerSelection: false,
      player1Name: "",
      player2Name: "",
      chanceToRollDice: "",
    };
  }

  setPlayer1Name = (name) => {
    this.setState({ player1Name: name });
    if (!this.state.chanceToRollDice) this.setState({ chanceToRollDice: name });
  };
  setPlayer2Name = (name) => {
    this.setState({ player2Name: name });
  };

  // componentDidMount() {
  //   console.log("App component mounted");
  // }

  //function to update the number of players
  updateNumberOfPlayers = () => {
    // this.setState({
    //   numOfPlayers: e.target.value,
    //   invalidNumOfPlayers: e.target.value > 4 || e.target.value < 2,
    // });
    const currentChance = this.state.chanceToRollDice;
    if (currentChance === this.state.player1Name) {
      this.setState({
        chanceToRollDice: this.state.player2Name,
      });
    } else {
      this.setState({
        chanceToRollDice: this.state.player1Name,
      });
    }
  };
  //function to initialize the game
  initializeGame = () => {
    let playersState = {};
    for (let i = 1; i <= this.state.numOfPlayers; i++) {
      playersState[`P${i}`] = {
        currentPosition: -4,
      };
    }
    // playersState[this.state.player1Name] = { currentPosition: 0 };
    // playersState[this.state.player2Name] = { currentPosition: 0 };
    this.setState({
      showLayout: true,
      hidePlayerSelection: true,
      ...playersState,
      chanceToRollDice: "P1",
    });
  };
  updateChanceToRollDice = () => {
    const currentChance = this.state.chanceToRollDice;
    const playerIndex = currentChance.split("")[1];
    if (playerIndex.toString() === this.state.numOfPlayers.toString()) {
      this.setState({
        chanceToRollDice: "P1",
      });
    } else {
      this.setState({
        chanceToRollDice: `P${Number(playerIndex) + 1}`,
      });
    }
    // const currentChance = this.state.chanceToRollDice;
    // if (currentChance === this.state.player1Name) {
    //   this.setState({
    //     chanceToRollDice: this.state.player2Name,
    //   });
    // } else {
    //   this.setState({
    //     chanceToRollDice: this.state.player1Name,
    //   });
  };

  // checkSnakeOrLadder = () => {
  //   const currentChance = this.state.chanceToRollDice;
  //   const currentPlayerPostion = this.state[currentChance].currentPosition;
  //   snakePositions.forEach((obj) => {
  //     if (obj.currentPosition === currentPlayerPostion) {
  //       alert(`Bad Luck Player ${currentChance}! Snake caught you - Going to position ${obj.gotoPosition}`);
  //       this.setState({
  //         [currentChance]: {
  //           currentPosition: obj.gotoPosition,
  //         },
  //       });
  //     }
  //   });
  //   ladderPositions.forEach((obj) => {
  //     if (obj.currentPosition === currentPlayerPostion) {
  //       alert(`Great Player ${currentChance}! Ladder taking u to position ${obj.gotoPosition}`);
  //       this.setState({
  //         [currentChance]: {
  //           currentPosition: obj.gotoPosition,
  //         },
  //       });
  //     }
  //   });
  // };
  updatePlayerPosition = () => {
    const currentChance = this.state.chanceToRollDice;
    const currentPlayerPostion = this.state[currentChance].currentPosition;
    if (currentPlayerPostion + this.state.diceValue >= 25) {
      alert(`Game Over !!! Congrats ${currentChance}`);
      this.setState({
        numOfPlayers: 2,
        hidePlayerSelection: false,
        showLayout: false,
      });
      return;
    }
    this.setState(
      {
        [currentChance]: {
          currentPosition: currentPlayerPostion + this.state.diceValue,
        },
      },
      this.checkSnakeOrLadder
    );
  };
  rollDice = (num) => {
    this.setState(
      {
        diceValue: num,
      },
      this.updatePlayerPosition
    );
    this.updateChanceToRollDice(); // to be called last setTimeout
  };

  getNamesofPlayers = () => {
    let str = "";
    for (let i = 1; i <= this.state.numOfPlayers; i++) {
      str = str + ` P${i}`;
    }
    return str;
  };

  render() {
    const { numOfPlayers, showLayout, hidePlayerSelection, chanceToRollDice } = this.state;
    return (
      <Grid container direction="column">
        <div className="App">
          <div>
            {/* <Grid xs={12} md={12}>
                <h1>Board Game</h1>
              </Grid> */}

            <Container justifyContent="center" alignItems="center">
              <>{!hidePlayerSelection && <SetPlayers setPlayer1Name={this.setPlayer1Name} setPlayer2Name={this.setPlayer2Name} numOfPlayers={numOfPlayers} updateNumberOfPlayers={this.updateNumberOfPlayers} showLayout={this.initializeGame} />}</>{" "}
            </Container>

            {showLayout && (
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item md={4} justifyContent="center">
                  <p>
                    Players are {this.state.player1Name} & {this.state.player2Name}
                  </p>
                  <p>Chance to Roll Dice is with {chanceToRollDice}</p>
                  <Grid container>
                    <Grid item md={6}>
                      <Dice rollDice={this.rollDice} />
                    </Grid>
                    <Grid item md={6}>
                      <HandWriting />
                    </Grid>
                  </Grid>

                  <Ledger player1Name={this.state.player1Name} player2Name={this.state.player2Name} />
                </Grid>

                <Grid item md={8}>
                  {showLayout && <Layout updatedState={this.state} />}
                </Grid>
              </Grid>
            )}
          </div>
        </div>
      </Grid>
    );
  }
}

export default App;
