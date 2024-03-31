let result = "";
let gen = "";
let gen_num = 0;
let totalstroke = 0;
let fontscore = 0;

var hanziLookupDemoApp = (function () {
  var _filesToLoad;
  var _drawingBoard;

  $(document).ready(function () {
    // Only fetch data (large, takes long) when the page has loaded
    _filesToLoad = 2;
    HanziLookup.init("mmah", "../dist/mmah.json", fileLoaded);
    HanziLookup.init("orig", "../dist/orig.json", fileLoaded);
  });

  function saveDrawingBoardAsImage() {
    // Get the canvas element
    var canvas = $(".drawingBoard").first().find("canvas")[0];
    // Get a data URL representing the image
    var dataUrl = canvas.toDataURL("image/jpg");
    // Create a new 'a' element
    var link = document.createElement("a");
    // Set the href of the link to the data URL
    link.href = dataUrl;
    // Set the download attribute of the link to specify the file name
    link.download = "drawing.jpg";
    // Trigger a click event on the link to start the download
    link.click();
  }

  //Random find a word from a json file (random line)
  function extractFirstCharacterFromRandomLine(targetElementId) {
    fetch("../dist/mmah.json")
      .then((response) => response.json())
      .then((data) => {
        const lines = data.chars;
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        gen = randomLine[0];
        gen_num = randomLine[1];
        // Use the first character as needed
        //console.log(firstCharacter);
        const targetElement = document.getElementById("targetElementId");
        targetElement.textContent = gen + " " + gen_num;
      });
  }

  document.querySelector(".js-gen").addEventListener("click", function () {
    extractFirstCharacterFromRandomLine();
  });

  document.querySelector(".js-download").addEventListener("click", function () {
    saveDrawingBoardAsImage();
  });

  //Save Result --> scores
  function SaveResult(resultElementID) {
    const resultElement = document.getElementById("resultElementID");
    fontscore = 0;
    if (result === gen) {
      // console.log("Total Stroke" + totalstroke);
      // console.log("Gen Num" + gen_num);
      if (totalstroke === gen_num) {
        fontscore = 100;
        resultElement.textContent = "Total Number of Strokes & Word are matched! Score =" + fontscore;
      } else {
        fontscore = 50;
        resultElement.textContent = "Only word is matched! Score =" + fontscore;
      }
    } else if (totalstroke === gen_num) {
      fontscore = 50;
      resultElement.textContent = "Only no. of stroke is matched! Score =" + fontscore;
    } else {
      resultElement.textContent = "Score =" + fontscore;
    }
  }

  document.querySelector(".js-save").addEventListener("click", function () {
    SaveResult();
  });

  // Initializes mini-app once all scripts have loaded
  function fileLoaded(success) {
    if (!success) {
      _filesToLoad = -1;
      $(".drawingBoard span").text("Failed to load data.");
      return;
    }
    --_filesToLoad;
    if (_filesToLoad != 0) return;
    // All data scripts loaded
    $(".drawingBoard").removeClass("loading");
    // Create handwriting canvas (this is optional, you can bring your own)
    _drawingBoard = HanziLookup.DrawingBoard($(".drawingBoard").first(), lookup);
    // Undo/redo commands - have to do with input
    $(".cmdUndo").click(function (evt) {
      _drawingBoard.undoStroke();
      _drawingBoard.redraw();
      lookup();
    });
    $(".cmdClear").click(function (evt) {
      _drawingBoard.clearCanvas();
      _drawingBoard.redraw();
      lookup();
      totalstroke = 0;
      console.log("Totoal number of strokes =" + totalstroke);
    });
  }

  // Fetches hand-drawn input from drawing board and looks up Hanzi
  function lookup() {
    // Decompose character from drawing board
    var analyzedChar = new HanziLookup.AnalyzedCharacter(_drawingBoard.cloneStrokes());
    // Look up with original HanziLookup data
    // var matcherOrig = new HanziLookup.Matcher("orig");
    // matcherOrig.match(analyzedChar, 8, function (matches) {
    //   showResults($(".hanziLookupChars"), matches);
    // });
    // Look up with MMAH data
    var matcherMMAH = new HanziLookup.Matcher("mmah");
    matcherMMAH.match(analyzedChar, 8, function (matches) {
      console.log("Matches: " + matches[0].score);
      console.log(matches[0]);
      showResults($(".mmahLookupChars"), matches);
    });
  }

  // Populates UI with (ordered) Hanzi matches
  function showResults(elmHost, matches) {
    elmHost.html("");
    result = matches[0].character;
    for (var i = 0; i != matches.length; ++i) {
      elmHost.append("<span>" + matches[i].character + "</span>"); //matches[i].character is the exact character
    }
    totalstroke = totalstroke + 1;
    console.log("Totoal number of strokes =" + totalstroke);
    updateCharacter();
  }
})();

var step = 0;
if (fontscore === 100) {
  step = 2;
} else if (fontscore === 50) {
  step = 1;
} else {
  step = 0;
}

var writer;
var isCharVisible;
var isOutlineVisible;

function printStrokePoints(data) {
  var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
  console.log(`[${pointStrs.join(", ")}]`);
}

function updateCharacter() {
  document.getElementById("#target").innerHTML = ""; //clear the previous character
  var character = result;
  fetch("../dist/mmah.json")
    .then((response) => response.json())
    .then((data) => {
      var characterData = data.chars.find((arr) => arr[0] === character);
      //console.log(characterData);
      if (characterData) {
        var firstElement = characterData[0];
        var secondElement = characterData[1];
        console.log("Detected word:" + firstElement + "& its number of stroke =" + secondElement);
      } else {
        console.log("No matching character data found.");
      }
    });

  window.location.hash = gen;
  writer = HanziWriter.create("#target", gen, {
    width: 250,
    height: 250,
    renderer: "canvas", //originally render svg
    radicalColor: "#166E16",
    onCorrectStroke: printStrokePoints,
    onMistake: printStrokePoints,
    showCharacter: false,
  });
  isCharVisible = true;
  isOutlineVisible = true;
  window.writer = writer;
}

window.onload = function () {
  var cha = decodeURIComponent(window.location.hash.slice(1));
  if (cha) {
    document.querySelector(".js-char").value = cha;
  }
  updateCharacter();
  document.querySelector(".js-animate").addEventListener("click", function () {
    writer.animateCharacter();
  });

  document.querySelector(".js-quiz").addEventListener("click", function () {
    writer.quiz({
      showOutline: true,
      onMistake: function (strokeData) {
        console.log("Oh no! you made a mistake on stroke " + strokeData.strokeNum);
        console.log("You've made " + strokeData.mistakesOnStroke + " mistakes on this stroke so far");
        console.log("You've made " + strokeData.totalMistakes + " total mistakes on this quiz");
        console.log("There are " + strokeData.strokesRemaining + " strokes remaining in this character");
      },
      onCorrectStroke: function (strokeData) {
        console.log("Yes!!! You got stroke " + strokeData.strokeNum + " correct!");
        console.log("You made " + strokeData.mistakesOnStroke + " mistakes on this stroke");
        console.log("You've made " + strokeData.totalMistakes + " total mistakes on this quiz");
        console.log("There are " + strokeData.strokesRemaining + " strokes remaining in this character");
      },
      onComplete: function (summaryData) {
        console.log("You did it! You finished drawing " + summaryData.character);
        console.log("You made " + summaryData.totalMistakes + " total mistakes on this quiz");
        if (summaryData.totalMistakes == 0) {
          console.log("Your total score is 100/100!");
        }
      },
    });
  });
};

function onOpenCvReady() {
  cv.onRuntimeInitialized = function () {};
}

//Hough Transform
function doHoughTransform(input, canvasID) {
  let threshold = document.getElementById("threshold").value;
  threshold = parseInt(threshold, 10);
  console.log(threshold);
  let src = cv.imread(input);
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  //new cv.Mat();
  // let cdst = new cv.Mat();
  let lines = new cv.Mat();
  let color = new cv.Scalar(255, 0, 0);
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.Canny(src, src, 50, 200, 3);
  // cv.cvtColor(dst, cdst, cv.COLOR_GRAY2RGBA, 0);
  cv.HoughLines(src, lines, 1, Math.PI / 180, threshold, 0, 0, 0, Math.PI);
  for (let i = 0; i < lines.rows; ++i) {
    let rho = lines.data32F[i * 2];
    let theta = lines.data32F[i * 2 + 1];
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = { x: x0 - 1000 * b, y: y0 + 1000 * a };
    let endPoint = { x: x0 + 1000 * b, y: y0 - 1000 * a };
    cv.line(dst, startPoint, endPoint, color);
  }
  cv.imshow(canvasID, dst);
  src.delete();
  dst.delete();
  lines.delete();
}

document.querySelector(".js-hough").addEventListener("click", function () {
  var getwritten = $(".drawingBoard").first().find("canvas")[0]; //means the first canvas in the drawingBoard
  console.log(getwritten);
  doHoughTransform(getwritten, "output_canvas");
  var targetDiv = document.getElementById("#target");
  var getans = targetDiv.querySelector("canvas");
  doHoughTransform(getans, "output_canvas2");
  // Get the canvases
  var canvas1 = document.getElementById("output_canvas");
  var canvas2 = document.getElementById("output_canvas2");

  // Convert the canvases to cv.Mat
  var img1 = cv.imread(canvas1);
  var img2 = cv.imread(canvas2);

  // Initiate ORB detector
  var orb = new cv.ORB();

  // Find the keypoints and descriptors with ORB
  var kp1 = new cv.KeyPointVector();
  var kp2 = new cv.KeyPointVector();
  var des1 = new cv.Mat();
  var des2 = new cv.Mat();
  orb.detectAndCompute(img1, new cv.Mat(), kp1, des1);
  orb.detectAndCompute(img2, new cv.Mat(), kp2, des2);

  // Match descriptors.
  var bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
  var matches = new cv.DMatchVector();
  bf.match(des1, des2, matches);
  var matchesArray = Array.from({ length: matches.size() }, (v, i) => matches.get(i));

  // Sort the array
  matchesArray.sort(function (a, b) {
    return a.distance - b.distance;
  });

  console.log("Number of matches:", matches.size());
});

// var consoleLog = document.getElementById("consoleLog");
// console.log = function () {
//   var message = Array.prototype.join.call(arguments, " ");
//   consoleLog.innerHTML += message + "<br>";
// };
