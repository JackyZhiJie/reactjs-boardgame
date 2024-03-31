import React from "react";
import ReactDice from "react-dice-complete";

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
        <ReactDice numDice={1} rollDone={this.rollDoneCallback} ref={this.reactDiceRef} />
        <button onClick={this.rollAll}>Roll Dice</button>
      </>
    );
  }
}

export default Dice;
