import FaceIcon from "@mui/icons-material/Face";
import Face2Icon from "@mui/icons-material/Face2";
import Face3Icon from "@mui/icons-material/Face3";
import Face4Icon from "@mui/icons-material/Face4";

export const Player = () => {
  return (
    <div>
      <div className="ledger-player">
        Player 1 is <FaceIcon />
      </div>
      <div className="ledger-player">
        Player 2 is <div className="P2_shape m-l-20" />
      </div>
      <div className="ledger-player">
        Player 3 is <div className="P3_shape m-l-20" />
      </div>
      <div className="ledger-player">
        Player 4 is <div className="P4_shape m-l-20" />
      </div>
    </div>
  );
};
