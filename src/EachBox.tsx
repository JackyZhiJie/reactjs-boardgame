import React from "react";
import FaceIcon from "@mui/icons-material/Face";
import Face2Icon from "@mui/icons-material/Face2";

interface Player {
  currentPosition: number;
}

interface UpdatedState {
  numOfPlayers: number;
  [playerName: string]: Player | number;
}

interface Props {
  boxIndex: number;
  updatedState: UpdatedState;
}

export const EachBox: React.FC<Props> = (props) => {
  const { boxIndex, updatedState } = props;
  const { numOfPlayers } = updatedState;

  const getPlayerNamesArr = (): string[] => {
    let arr = [];
    for (let i = 1; i <= numOfPlayers; i++) {
      arr.push(`P${i}`);
    }
    return arr;
  };

  return (
    <div className="each-box">
      <div className="icons-in-box">
        {getPlayerNamesArr().map((playerName) => {
          const player = updatedState[playerName];
          if (typeof player !== "number" && player.currentPosition === boxIndex) {
            // return <div className={`${playerName}_shape`} />;
            if (typeof player !== "number" && player.currentPosition === boxIndex) {
              if (playerName === "P1") {
                return <FaceIcon />;
              } else if (playerName === "P2") {
                return <Face2Icon />;
              }
            }
          }
          return null;
        })}
      </div>
      <div style={{ fontSize: "10px" }}>{boxIndex}</div>
    </div>
  );
};
