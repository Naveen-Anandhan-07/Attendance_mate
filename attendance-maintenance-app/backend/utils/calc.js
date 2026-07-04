// Shared calculation helpers for attendance & GPA

const GRADE_POINTS = {
  O: 10,
  S: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  F: 0
};

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// percentage = (attended/happened)*100
function calcPercentage(attended, happened) {
  if (happened === 0) return 0;
  return round2((attended / happened) * 100);
}

function calcStatus(percentage) {
  if (percentage >= 85) return 'Safe';
  if (percentage >= 75) return 'Warning';
  return 'Critical';
}

// leaves allowed while staying >= 75%, or classes needed to reach 75%
function calcLeaveOrRecovery(attended, happened) {
  const percentage = calcPercentage(attended, happened);
  if (percentage >= 75) {
    const maxLeaves = Math.floor(attended / 0.75 - happened);
    return { type: 'leaves', value: Math.max(maxLeaves, 0) };
  } else {
    const needed = Math.ceil((0.75 * happened - attended) / 0.25);
    return { type: 'needed', value: Math.max(needed, 0) };
  }
}

function calcBunkPlanner(attended, happened) {
  const currentPct = calcPercentage(attended, happened);
  const afterSkipPct = calcPercentage(attended, happened + 1);
  const afterAttendPct = calcPercentage(attended + 1, happened + 1);
  const recovery = calcLeaveOrRecovery(attended, happened);
  const canSkipNext = currentPct >= 75 && afterSkipPct >= 75;
  return {
    currentPercentage: currentPct,
    canSkipNext,
    afterSkipPercentage: afterSkipPct,
    afterAttendPercentage: afterAttendPct,
    leavesAvailable: recovery.type === 'leaves' ? recovery.value : 0,
    classesNeeded: recovery.type === 'needed' ? recovery.value : 0
  };
}

module.exports = {
  GRADE_POINTS,
  round2,
  calcPercentage,
  calcStatus,
  calcLeaveOrRecovery,
  calcBunkPlanner
};
