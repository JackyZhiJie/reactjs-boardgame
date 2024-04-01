import React from "react";
import ReactDice from "react-dice-complete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

interface DiceProps {
  rollDice: (num: number) => void;
}

class Dice extends React.Component<DiceProps> {
  reactDiceRef: React.RefObject<any>;

  constructor(props: DiceProps) {
    super(props);
    this.reactDiceRef = React.createRef();
  }

  rollAll = () => {
    if (this.reactDiceRef.current) {
      this.reactDiceRef.current.rollAll();
    }
  };

  rollDoneCallback = (num: number) => {
    const { rollDice } = this.props;
    rollDice(num);
  };

  render() {
    return (
      <>
        <ReactDice numDice={1} rollDone={this.rollDoneCallback} ref={this.reactDiceRef} faceColor="hsl(185, 50%, 50%)" dotColor="white" />

        <Button variant="contained" onClick={this.rollAll} style={{ backgroundColor: "hsl(185, 50%, 50%)" }}>
          Roll Dice
        </Button>
      </>
    );
  }
}

export default Dice;
