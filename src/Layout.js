import * as R from "ramda";
import { EachBox } from "./EachBox";

export const Layout = (props) => {
  const renderBoxes = (props) => {
    const { updatedState } = props;
    return R.pipe(
      R.splitEvery(5), // means 5 boxes in a row
      R.addIndex(R.map)((row, index) => {
        return (
          <div className="box-row" key={index}>
            {R.map((box) => {
              return (
                <div key={box} className="box">
                  <span>
                    <EachBox boxIndex={box} updatedState={updatedState} numOfPlayers={updatedState.numOfPlayers} />
                  </span>
                </div>
              );
            }, row)}
          </div>
        );
      })
    )(R.range(1, 26));
  };
  return <div className="board">{renderBoxes(props)}</div>;
};
