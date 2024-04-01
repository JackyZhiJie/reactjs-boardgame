import FaceIcon from "@mui/icons-material/Face";
import Face2Icon from "@mui/icons-material/Face2";
import Grid from "@mui/material/Grid";
interface LedgerProps {
  player1Name: string;
  player2Name: string;
}

export const Ledger: React.FC<LedgerProps> = ({ player1Name, player2Name }) => {
  return (
    <Grid container justifyContent="center">
      <div className="ledger-player">
        {player1Name} is <FaceIcon />
      </div>

      <div className="ledger-player">
        {player2Name} is <Face2Icon />
      </div>
    </Grid>
  );
};
