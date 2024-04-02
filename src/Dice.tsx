import React from "react";
import ReactDice from "react-dice-complete";
import Button from "@mui/material/Button";

interface DiceProps {
  rollDice: (num: number) => void;
}
// The Dice component is a class component that uses the react-dice-complete library to create a dice rolling game. The component has a rollAll method that calls the rollAll method of the reactDiceRef object. The rollDoneCallback method is called when the dice is rolled and calls the rollDice method passed as a prop. The render method returns a ReactDice component and a Button component that calls the rollAll method when clicked.

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
