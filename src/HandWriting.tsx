import React, { useCallback, useEffect, useState } from "react";
import HanziLookup from "./HanziLookupJS/dist/hanzilookup";
import { Button } from "@mui/material";
import styled from "styled-components";
import mmah from "./HanziLookupJS/dist/mmah.json";
import orig from "./HanziLookupJS/dist/orig.json";

const StyledContainer = styled.div`
  position: relative;
  float: left;
  box-sizing: border-box;
  height: auto;
  overflow: auto;
  width: 100%;
  margin: 0;
`;

const DrawingBoard = styled.div`
  width: 200px;
  height: 200px;
  cursor: crosshair;
  clear: both;
  overflow: hidden;
  background-color: #fafafa;
`;

function HandWriting() {
  const [drawingBoard, setDrawingBoard] = useState<any>(null);

  // Fetches hand-drawn input from drawing board and looks up Hanzi
  const lookup = useCallback(() => {
    // Decompose character from drawing board
    var analyzedChar = new HanziLookup.AnalyzedCharacter(drawingBoard["cloneStrokes"]());
    // Look up with original HanziLookup data
    let matcherOrig: any = HanziLookup.Matcher("orig");
    matcherOrig.match(analyzedChar, 8, function (matches: any) {
      // showResults(document.querySelector(".hanziLookupChars"), matches);
    });
    // Look up with MMAH data
    let matcherMMAH = HanziLookup.Matcher("mmah");
    matcherMMAH.match(analyzedChar, 8, function (matches: any) {
      // showResults(document.querySelector(".mmahLookupChars"), matches);
    });
  }, [drawingBoard]);

  useEffect(() => {
    // Only fetch data (large, takes long) when the page has loaded
    HanziLookup.init("mmah", JSON.stringify(mmah));
    HanziLookup.init("orig", JSON.stringify(orig));
    setDrawingBoard(HanziLookup.DrawingBoard(document.querySelector(".drawingBoard"), lookup));
  }, [lookup]);

  const handleUndo = () => {
    drawingBoard.undoStroke();
    drawingBoard.redraw();
    lookup();
  };

  const handleClear = () => {
    drawingBoard.clearCanvas();
    drawingBoard.redraw();
    lookup();
  };

  // Populates UI with (ordered) Hanzi matches
  // function showResults(elmHost: HTMLElement, matches: any) {
  //   elmHost.innerHTML = "";
  //   for (var i = 0; i !== matches.length; ++i) {
  //     var span = document.createElement("span");
  //     span.textContent = matches[i].character;
  //     elmHost.appendChild(span);
  //   }
  // }

  return (
    <StyledContainer className="">
      <StyledContainer className="colLeft">
        <DrawingBoard className="">
          <span>
            <StyledContainer className="loadingIndicator"></StyledContainer>
            <div className="drawingBoard"></div>
          </span>
        </DrawingBoard>
        <StyledContainer className="commands" style={{ justifyContent: "space-evenly" }}>
          <Button onClick={handleUndo}>Undo</Button>
          <Button onClick={handleClear}>Clear</Button>
        </StyledContainer>
      </StyledContainer>
      {/* <StyledContainer className="colRight">
        <h1>Recognized characters</h1>
        <h2>Original HanziLookup data</h2>
        <StyledContainer className="charPicker hanziLookupChars"></StyledContainer>
        <h2>Make Me a Hanzi data</h2>
        <StyledContainer className="charPicker mmahLookupChars"></StyledContainer>
      </StyledContainer> */}
    </StyledContainer>
  );
}

export default HandWriting;
