import { Button, Grid } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import AnalyzedCharacter from "./hanziLookup/analyzedCharacter";
import Matcher from "./hanziLookup/matcher";

interface StrokeInputOverlay {
  left: number;
  top: number;
  right: number;
  bottom: number;
  xStrokes: number[][][];
  yStrokes: number[][][];
  zStrokes: number[][][] | null;
}

interface HanziDrawingBoardProps {
  onLookup?: (matches: string[]) => void;
}

const StyledCanvas = styled.canvas`
  cursor: crosshair;
  clear: both;
  overflow: hidden;
  background-color: #fafafa;
`;

const HanziDrawingBoard = (props: HanziDrawingBoardProps) => {
  //#region UseStates
  const [d, setD] = useState<number[][][]>([]);
  const [m, setM] = useState<StrokeInputOverlay | null>(null);
  const [S, setS] = useState(!1);
  const [b, setB] = useState(!1);
  const [y, setY] = useState(!1);
  const [u, setU] = useState(!0);
  const [T, setT] = useState<number[][]>([]);
  const [f, setF] = useState<number[]>([]);
  const [l, setL] = useState(new Date());
  const [k, setK] = useState(-1);
  const [p, setP] = useState(-1);
  const [r, setR] = useState<HTMLCanvasElement | null>(null);
  const [h, setH] = useState<CanvasRenderingContext2D | null>(null);
  //#endregion

  const c = 5;

  // Init
  useEffect(() => {
    if (r) {
      setH(r.getContext("2d"));
    }
  }, [r]);

  //#region Internal Functions
  const n = () => {
    if (h) {
      h.clearRect(0, 0, h.canvas.width, h.canvas.height);
    }
  };

  const o = (e: number, t: number) => {
    setU(!0);
    setT([]);
    let _f = [e, t];
    setF(_f);
    T.push(_f);
    if (h) {
      let _h = h;
      _h.strokeStyle = "grey";
      _h.setLineDash([]);
      _h.lineWidth = c;
      _h.beginPath();
      _h.moveTo(e, t);
    }
    setL(new Date());
  };

  const i = (e: number, t: number) => {
    if (!(new Date().getTime() - l.getTime() < 50)) {
      setL(new Date());
      let n = [e, t];
      if (n[0] === f[0] && n[1] === f[1]) {
        T.push(n);
      } else {
        T.push(n);
        setF(n);
        if (h) {
          h.lineTo(e, t);
          h.stroke();
        }
      }
    }
  };
  const a = (e: number, t: number) => {
    setU(!1);
    if (e !== -1) {
      if (h) {
        h.lineTo(e, t);
        h.stroke();
      }
      T.push([e, t]);
      d.push(T);
      setT([]);
      lookup();
    }
  };
  const s = () => {
    for (let e in d) {
      if (h) {
        h.strokeStyle = "grey";
        h.setLineDash([]);
        h.lineWidth = c;
        h.beginPath();
        h.moveTo(d[e][0][0], d[e][0][1]);
        for (let t = d[e].length, n = 0; n < t - 1; n++) {
          h.lineTo(d[e][n][0], d[e][n][1]);
          h.stroke();
          h.lineTo(d[e][t - 1][0], d[e][t - 1][1]);
          h.stroke();
        }
      }
    }
    if (m) {
      if (h) {
        if ((S && ((h.strokeStyle = "blue"), h.setLineDash([1, 1]), (h.lineWidth = 0.5), h.beginPath(), h.moveTo(m.left, m.top), h.lineTo(m.right, m.top), h.stroke(), h.lineTo(m.right, m.bottom), h.stroke(), h.lineTo(m.left, m.bottom), h.stroke(), h.lineTo(m.left, m.top), h.stroke()), b))
          for (let o = 0; o !== m.xStrokes.length; ++o) {
            let i = m.xStrokes[o];
            h.strokeStyle = "red";
            h.setLineDash([]);
            h.lineWidth = 1;
            h.beginPath();
            h.moveTo(i[0][0], i[0][1]);
            h.arc(i[0][0], i[0][1], 3, 0, 2 * Math.PI, !0);
            h.fillStyle = "red";
            h.fill();
            for (let a = 1; a < i.length; ++a) {
              h.lineTo(i[a][0], i[a][1]);
              h.stroke();
              h.beginPath();
              h.arc(i[a][0], i[a][1], 3, 0, 2 * Math.PI, !0);
              h.fillStyle = "red";
              h.fill();
            }
          }
        if (y && m.yStrokes)
          for (let o = 0; o !== m.yStrokes.length; ++o) {
            let s = m.yStrokes[o];
            h.strokeStyle = "#e6cee6";
            h.setLineDash([]);
            h.lineWidth = c;
            h.beginPath();
            h.moveTo(s[0][0], s[0][1]);
            for (let a = 1; a < s.length; ++a) h.lineTo(s[a][0], s[a][1]);
            h.stroke();
          }
        if (m.zStrokes) {
          for (let o = 0; o !== m.zStrokes.length; ++o) {
            let i = m.zStrokes[o];
            h.strokeStyle = "green";
            h.setLineDash([]);
            h.lineWidth = 1;
            h.beginPath();
            h.moveTo(i[0][0], i[0][1]);
            h.arc(i[0][0], i[0][1], 3, 0, 2 * Math.PI, true);
            h.fillStyle = "green";
            h.fill();
            for (let a = 1; a < i.length; ++a) {
              h.lineTo(i[a][0], i[a][1]);
              h.stroke();
              h.beginPath();
              h.arc(i[a][0], i[a][1], 3, 0, 2 * Math.PI, true);
              h.fillStyle = "green";
              h.fill();
            }
          }
        }
      }
    }
  };
  //#endregion

  //#region Functions

  // Fetches hand-drawn input from drawing board and looks up Hanzi
  const lookup = useCallback(() => {
    // Decompose character from drawing board
    let analyzedChar = new AnalyzedCharacter(cloneStrokes());
    // Look up with MMAH data
    let matcherMMAH = Matcher("mmah");
    matcherMMAH.match(analyzedChar, 8, function (matches: string[]) {
      console.log(matches);
    });
  }, []);

  function clearCanvas() {
    setD([]);
  }
  function undoStroke() {
    setD(d.slice(0, d.length - 1));
  }
  function cloneStrokes() {
    let e = [];
    let n = [];
    for (let t = 0; t !== d.length; ++t) {
      for (let o = 0; o !== d[t].length; ++o) {
        n.push([d[t][o][0], d[t][o][1]]);
      }
      e.push(n);
    }
    return e;
  }
  function redraw() {
    n();
    s();
  }
  function enrich(e: StrokeInputOverlay, t: boolean, o: boolean, i: boolean) {
    setM(e);
    setS(o);
    setB(t);
    setY(i);
    n();
    s();
  }
  //#endregion

  //#region Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (u) {
      let t = e.pageX - e.currentTarget.offsetLeft,
        n = e.pageY - e.currentTarget.offsetTop;
      i(t, n);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let t = e.pageX - e.currentTarget.offsetLeft,
      n = e.pageY - e.currentTarget.offsetTop;
    o(t, n);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let t = e.pageX - e.currentTarget.offsetLeft,
      n = e.pageY - e.currentTarget.offsetTop;
    a(t, n);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (u) {
      let t = e.touches[0].pageX - e.currentTarget.offsetLeft;
      setK(t);
      let n = e.touches[0].pageY - e.currentTarget.offsetTop;
      setP(n);
      i(t, n);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.currentTarget.parentElement?.blur();
    let t = e.touches[0].pageX - e.currentTarget.offsetLeft,
      n = e.touches[0].pageY - e.currentTarget.offsetTop;
    o(t, n);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.currentTarget.parentElement?.blur();
    a(k, p);
    setK(-1);
    setP(-1);
  };

  function handleUndo(): void {
    undoStroke();
    redraw();
    lookup();
  }

  function handleClear(): void {
    clearCanvas();
    redraw();
    lookup();
  }

  //#endregion

  return (
    <Grid container spacing={3}>
      <Grid item>
        <StyledCanvas ref={(r) => setR(r)} className="stroke-input-canvas" width={200} height={200} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onTouchMove={handleTouchMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
      </Grid>
      <Grid item>
        <Button onClick={handleUndo}>Undo</Button>
        <Button onClick={handleClear}>Clear</Button>
      </Grid>
    </Grid>
  );
};

export default HanziDrawingBoard;
