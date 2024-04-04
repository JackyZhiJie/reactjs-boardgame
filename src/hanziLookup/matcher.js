import { data } from "./init";
import MatchCollector from "./matchCollector";
import CharacterMatch from "./characterMatch";
import CubicCurve2D from "./cubicCurve2D";

// Magic constants
const MAX_CHARACTER_STROKE_COUNT = 48;
const MAX_CHARACTER_SUB_STROKE_COUNT = 64;
const DEFAULT_LOOSENESS = 0.15;
const AVG_SUBSTROKE_LENGTH = 0.33; // an average length (out of 1)
const SKIP_PENALTY_MULTIPLIER = 1.75; // penalty mulitplier for skipping a stroke
const CORRECT_NUM_STROKES_BONUS = 0.1; // max multiplier bonus if characters has the correct number of strokes
const CORRECT_NUM_STROKES_CAP = 10; // characters with more strokes than this will not be multiplied

const Matcher = function (dataName, looseness) {
  let _looseness = looseness || DEFAULT_LOOSENESS;
  let _repo = data[dataName].chars;
  let _sbin = data[dataName].substrokes;
  let _scoreMatrix = buildScoreMatrix();
  let _charsChecked;
  let _subStrokesCompared;

  let DIRECTION_SCORE_TABLE;
  let LENGTH_SCORE_TABLE;
  let POS_SCORE_TABLE;

  // Init score tables
  initScoreTables();

  function doMatch(inputChar, limit, ready) {
    // Diagnostic counters
    _charsChecked = 0;
    _subStrokesCompared = 0;

    // This will gather matches
    let matchCollector = new MatchCollector(limit);

    // Edge case: empty input should return no matches; but permissive lookup does find a few...
    if (inputChar.analyzedStrokes.length === 0) return matchCollector.getMatches();

    // Flat format: matching needs this. Only transform once.
    let inputSubStrokes = [];
    for (let i = 0; i !== inputChar.analyzedStrokes.length; ++i) {
      let stroke = inputChar.analyzedStrokes[i];
      console.log(stroke);
      for (let j = 0; j !== stroke.subStrokes.length; ++j) {
        inputSubStrokes.push(stroke.subStrokes[j]);
      }
    }

    // Some pre-computed looseness magic
    let strokeCount = inputChar.analyzedStrokes.length;
    let subStrokeCount = inputChar.subStrokeCount;
    // Get the range of strokes to compare against based on the loosness.
    // Characters with fewer strokes than strokeCount - strokeRange
    // or more than strokeCount + strokeRange won't even be considered.
    let strokeRange = getStrokesRange(strokeCount);
    let minimumStrokes = Math.max(strokeCount - strokeRange, 1);
    let maximumStrokes = Math.min(strokeCount + strokeRange, MAX_CHARACTER_STROKE_COUNT);
    // Get the range of substrokes to compare against based on looseness.
    // When trying to match sub stroke patterns, won't compare sub strokes
    // that are farther about in sequence than this range.  This is to make
    // computing matches less expensive for low loosenesses.
    let subStrokesRange = getSubStrokesRange(subStrokeCount);
    let minSubStrokes = Math.max(subStrokeCount - subStrokesRange, 1);
    let maxSubStrokes = Math.min(subStrokeCount + subStrokesRange, MAX_CHARACTER_SUB_STROKE_COUNT);
    // Iterate over all characters in repo
    for (let cix = 0; cix !== _repo.length; ++cix) {
      let repoChar = _repo[cix];
      let cmpStrokeCount = repoChar[1];
      let cmpSubStrokes = repoChar[2];
      if (cmpStrokeCount < minimumStrokes || cmpStrokeCount > maximumStrokes) continue;
      if (cmpSubStrokes.length < minSubStrokes || cmpSubStrokes.length > maxSubStrokes) continue;
      // Match against character in repo
      let match = matchOne(strokeCount, inputSubStrokes, subStrokesRange, repoChar);
      // File; collector takes care of comparisons and keeping N-best
      matchCollector.fileMatch(match);
    }
    // When done: just return collected matches
    // This is an array of CharacterMatch objects
    ready(matchCollector.getMatches());
  }

  function getStrokesRange(strokeCount) {
    if (_looseness === 0) return 0;
    if (_looseness === 1) return MAX_CHARACTER_STROKE_COUNT;
    // We use a CubicCurve that grows slowly at first and then rapidly near the end to the maximum.
    // This is so a looseness at or near 1.0 will return a range that will consider all characters.
    let ctrl1X = 0.35;
    let ctrl1Y = strokeCount * 0.4;
    let ctrl2X = 0.6;
    let ctrl2Y = strokeCount;
    let curve = new CubicCurve2D(0, 0, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, 1, MAX_CHARACTER_STROKE_COUNT);
    let t = curve.getFirstSolutionForX(_looseness);
    // We get the t value on the parametrized curve where the x value matches the looseness.
    // Then we compute the y value for that t. This gives the range.
    return Math.round(curve.getYOnCurve(t));
  }

  function getSubStrokesRange(subStrokeCount) {
    // Return the maximum if looseness = 1.0.
    // Otherwise we'd have to ensure that the floating point value led to exactly the right int count.
    if (_looseness === 1.0) return MAX_CHARACTER_SUB_STROKE_COUNT;
    // We use a CubicCurve that grows slowly at first and then rapidly near the end to the maximum.
    let y0 = subStrokeCount * 0.25;
    let ctrl1X = 0.4;
    let ctrl1Y = 1.5 * y0;
    let ctrl2X = 0.75;
    let ctrl2Y = 1.5 * ctrl1Y;
    let curve = new CubicCurve2D(0, y0, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, 1, MAX_CHARACTER_SUB_STROKE_COUNT);
    let t = curve.getFirstSolutionForX(_looseness);
    // We get the t value on the parametrized curve where the x value matches the looseness.
    // Then we compute the y value for that t. This gives the range.
    return Math.round(curve.getYOnCurve(t));
  }

  function buildScoreMatrix() {
    // We use a dimension + 1 because the first row and column are seed values.
    let dim = MAX_CHARACTER_SUB_STROKE_COUNT + 1;
    let res = [];
    for (let i = 0; i < dim; i++) {
      res.push([]);
      for (let j = 0; j < dim; j++) res[i].push(0);
    }
    // Seed the first row and column with base values.
    // Starting from a cell that isn't at 0,0 to skip strokes incurs a penalty.
    for (let i = 0; i < dim; i++) {
      let penalty = -AVG_SUBSTROKE_LENGTH * SKIP_PENALTY_MULTIPLIER * i;
      res[i][0] = penalty;
      res[0][i] = penalty;
    }
    return res;
  }

  function matchOne(inputStrokeCount, inputSubStrokes, subStrokesRange, repoChar) {
    // Diagnostic counter
    ++_charsChecked;

    // Calculate score. This is the *actual* meat.
    let score = computeMatchScore(inputStrokeCount, inputSubStrokes, subStrokesRange, repoChar);
    // If the input character and the character in the repository have the same number of strokes, assign a small bonus.
    // Might be able to remove this, doesn't really add much, only semi-useful for characters with only a couple strokes.
    if (inputStrokeCount === repoChar[1] && inputStrokeCount < CORRECT_NUM_STROKES_CAP) {
      // The bonus declines linearly as the number of strokes increases, writing 2 instead of 3 strokes is worse than 9 for 10.
      let bonus = (CORRECT_NUM_STROKES_BONUS * Math.max(CORRECT_NUM_STROKES_CAP - inputStrokeCount, 0)) / CORRECT_NUM_STROKES_CAP;

      score += bonus * score;
    }
    return new CharacterMatch(repoChar[0], score);
  }

  function computeMatchScore(strokeCount, inputSubStrokes, subStrokesRange, repoChar) {
    for (let x = 0; x < inputSubStrokes.length; x++) {
      // For each of the input substrokes...
      let inputDirection = inputSubStrokes[x].direction;
      let inputLength = inputSubStrokes[x].length;
      let inputCenter = [inputSubStrokes[x].centerX, inputSubStrokes[x].centerY];
      for (let y = 0; y < repoChar[2]; y++) {
        // For each of the compare substrokes...
        // initialize the score as being not usable, it will only be set to a good
        // value if the two substrokes are within the range.
        let newScore = Number.NEGATIVE_INFINITY;
        if (Math.abs(x - y) <= subStrokesRange) {
          // The range is based on looseness.  If the two substrokes fall out of the range
          // then the comparison score for those two substrokes remains Double.MIN_VALUE and will not be used.
          let compareDirection = _sbin[repoChar[3] + y * 3];
          let compareLength = _sbin[repoChar[3] + y * 3 + 1];
          let compareCenter = null;
          let bCenter = _sbin[repoChar[3] + y * 3 + 2];
          console.log("compareDirection", compareDirection);
          // console.log("compareDirection", repoChar[3] + y * 3);
          // console.log("compareLength", repoChar[3] + y * 3 + 1);
          // console.log("bCenter", repoChar[3] + y * 3 + 2);
          if (bCenter > 0) compareCenter = [(bCenter & 0xf0) >>> 4, bCenter & 0x0f];
          // We incur penalties for skipping substrokes.
          // Get the scores that would be incurred either for skipping the substroke from the descriptor, or from the repository.
          let skip1Score = _scoreMatrix[x][y + 1] - (inputLength / 256) * SKIP_PENALTY_MULTIPLIER;
          let skip2Score = _scoreMatrix[x + 1][y] - (compareLength / 256) * SKIP_PENALTY_MULTIPLIER;
          // The skip score is the maximum of the scores that would result from skipping one of the substrokes.
          let skipScore = Math.max(skip1Score, skip2Score);
          // The matchScore is the score of actually comparing the two substrokes.
          let matchScore = computeSubStrokeScore(inputDirection, inputLength, compareDirection, compareLength, inputCenter, compareCenter);
          // Previous score is the score we'd add to if we compared the two substrokes.
          let previousScore = _scoreMatrix[x][y];
          // Result score is the maximum of skipping a substroke, or comparing the two.
          newScore = Math.max(previousScore + matchScore, skipScore);
        }
        // Set the score for comparing the two substrokes.
        _scoreMatrix[x + 1][y + 1] = newScore;
      }
    }
    // At the end the score is the score at the opposite corner of the matrix...
    // don't need to use count - 1 since seed values occupy indices 0
    return _scoreMatrix[inputSubStrokes.length][repoChar[2]];
  }

  function computeSubStrokeScore(inputDir, inputLen, repoDir, repoLen, inputCenter, repoCenter) {
    // Diagnostic counter
    ++_subStrokesCompared;

    // Score drops off after directions get sufficiently apart, start to rise again as the substrokes approach opposite directions.
    // This in particular reflects that occasionally strokes will be written backwards, this isn't totally bad, they get
    // some score for having the stroke oriented correctly.
    let directionScore = getDirectionScore(inputDir, repoDir, inputLen);
    //let directionScore = Math.max(Math.cos(2.0 * theta), 0.3 * Math.cos((1.5 * theta) + (Math.PI / 3.0)));

    // Length score gives an indication of how similar the lengths of the substrokes are.
    // Get the ratio of the smaller of the lengths over the longer of the lengths.
    let lengthScore = getLengthScore(inputLen, repoLen);
    // Ratios that are within a certain range are fine, but after that they drop off, scores not more than 1.
    //let lengthScore = Math.log(lengthScore + (1.0 / Math.E)) + 1;
    //lengthScore = Math.min(lengthScore, 1.0);

    // For the final "classic" score we just multiply the two scores together.
    let score = lengthScore * directionScore;

    // If we have center points (from MMAH data), reduce score if strokes are farther apart
    if (repoCenter) {
      let dx = inputCenter[0] - repoCenter[0];
      let dy = inputCenter[1] - repoCenter[1];
      let closeness = POS_SCORE_TABLE[dx * dx + dy * dy];

      // let dist = Math.sqrt(dx * dx + dy * dy);
      // // Distance is [0 .. 21.21] because X and Y are all [0..15]
      // // Square distance is [0..450]
      // // TO-DO: a cubic function for this too
      // let closeness = 1 - dist / 22;
      // Closeness is always [0..1]. We reduce positive score, and make negative more negative.
      if (score > 0) score *= closeness;
      else score /= closeness;
    }
    return score;
  }

  function initScoreTables() {
    // Builds a precomputed array of values to use when getting the score between two substroke directions.
    // Two directions should differ by 0 - Pi, and the score should be the (difference / Pi) * score table's length
    // The curve drops as the difference grows, but rises again some at the end because
    // a stroke that is 180 degrees from the expected direction maybe OK passable.
    let dirCurve = new CubicCurve2D(0, 1.0, 0.5, 1.0, 0.25, -2.0, 1.0, 1.0);
    DIRECTION_SCORE_TABLE = initCubicCurveScoreTable(dirCurve, 256);

    // Builds a precomputed array of values to use when getting the score between two substroke lengths.
    // A ratio less than one is computed for the two lengths, and the score should be the ratio * score table's length.
    // Curve grows rapidly as the ratio grows and levels off quickly.
    // This is because we don't really expect lengths to lety a lot.
    // We are really just trying to distinguish between tiny strokes and long strokes.
    let lenCurve = new CubicCurve2D(0, 0, 0.25, 1.0, 0.75, 1.0, 1.0, 1.0);
    LENGTH_SCORE_TABLE = initCubicCurveScoreTable(lenCurve, 129);

    POS_SCORE_TABLE = [];
    for (let i = 0; i <= 450; ++i) {
      POS_SCORE_TABLE.push(1 - Math.sqrt(i) / 22);
    }
  }

  function initCubicCurveScoreTable(curve, numSamples) {
    let x1 = curve.x1();
    let x2 = curve.x2();
    let range = x2 - x1;
    let x = x1;
    let xInc = range / numSamples; // even incrementer to increment x value by when sampling across the curve
    let scoreTable = [];
    // Sample evenly across the curve and set the samples into the table.
    for (let i = 0; i < numSamples; i++) {
      let t = curve.getFirstSolutionForX(Math.min(x, x2));
      scoreTable.push(curve.getYOnCurve(t));
      x += xInc;
    }
    return scoreTable;
  }

  function getDirectionScore(direction1, direction2, inputLength) {
    // Both directions are [0..255], integer
    let theta = Math.abs(direction1 - direction2);
    // Lookup table for actual score function
    let directionScore = DIRECTION_SCORE_TABLE[theta];
    // Add bonus if the input length is small.
    // Directions doesn't really matter for small dian-like strokes.
    if (inputLength < 64) {
      let shortLengthBonusMax = Math.min(1.0, 1.0 - directionScore);
      let shortLengthBonus = shortLengthBonusMax * (1 - inputLength / 64);
      directionScore += shortLengthBonus;
    }
    return directionScore;
  }

  function getLengthScore(length1, length2) {
    // Get the ratio between the two lengths less than one.
    let ratio;
    // Shift for "times 128"
    if (length1 > length2) ratio = Math.round((length2 << 7) / length1);
    else ratio = Math.round((length1 << 7) / length2);
    // Lookup table for actual score function
    return LENGTH_SCORE_TABLE[ratio];
  }

  return {
    match: function (analyzedChar, limit, ready) {
      doMatch(analyzedChar, limit, ready);
    },

    getCounters: function () {
      return {
        chars: _charsChecked,
        subStrokes: _subStrokesCompared,
      };
    },
  };
};
export default Matcher;
