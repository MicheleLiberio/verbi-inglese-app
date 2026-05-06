let reportingCurrentCategory = "";
let reportingAnswered = false;
let reportingCorrect = 0;
let reportingWrong = 0;
let reportingTotal = 0;
let reportingGameOver = false;
let reportingSessionVerbs = [];
let reportingIndex = 0;

function prepareReportingSession() {
  reportingSessionVerbs = [];

  Object.keys(reportingVerbs).forEach(category => {
    reportingVerbs[category].forEach(verb => {
      reportingSessionVerbs.push({ verb, category });
    });
  });

  shuffleArray(reportingSessionVerbs);
  reportingIndex = 0;
}

function updateReportingScore() {
  document.getElementById("reportingCorrect").innerText = reportingCorrect;
  document.getElementById("reportingWrong").innerText = reportingWrong;
  document.getElementById("reportingTotal").innerText = reportingTotal;

  const percentage = reportingTotal === 0 ? 0 : Math.round((reportingCorrect / reportingTotal) * 100);
  document.getElementById("reportingPercentage").innerText = percentage + "%";
}

function setReportingButtons(disabled) {
  document.querySelectorAll(".reportingAnswer").forEach(btn => {
    btn.disabled = disabled;
  });
}

function newReportingVerb() {
  if (reportingGameOver) return;

  const item = reportingSessionVerbs[reportingIndex];
  reportingIndex++;

  reportingCurrentCategory = item.category;
  reportingAnswered = false;

  document.getElementById("reportingVerb").innerText = item.verb;
  document.getElementById("reportingResult").innerText = "";
  document.getElementById("reportingFinal").innerText = "";
  setReportingButtons(false);
}

function checkReporting(answer) {
  if (reportingAnswered || reportingGameOver) return;

  reportingAnswered = true;
  setReportingButtons(true);

  if (answer === reportingCurrentCategory) {
    document.getElementById("reportingResult").innerText = "😊";
    reportingCorrect++;
  } else {
    document.getElementById("reportingResult").innerText =
      "😢 Corretto: " + reportingLabels[reportingCurrentCategory];
    reportingWrong++;
  }

  reportingTotal++;
  updateReportingScore();

  if (reportingTotal >= MAX_QUESTIONS) {
    endReportingGame();
  } else {
    setTimeout(newReportingVerb, NEXT_DELAY);
  }
}

function endReportingGame() {
  reportingGameOver = true;

  saveHistory("reporting", reportingCorrect, reportingWrong, MAX_QUESTIONS);
  loadHistory("reporting");

  document.getElementById("reportingVerb").innerText = "Sessione completata";
  document.getElementById("restartReportingBtn").style.display = "inline-block";

  if (reportingCorrect === MAX_QUESTIONS) {
    document.getElementById("reportingFinal").innerText = "Perfetto! Hai fatto 10/10! 🎉";
    launchFireworks();
  } else {
    document.getElementById("reportingFinal").innerText =
      "Hai completato il quiz con " + reportingCorrect + "/10.";
  }
}

function restartReporting() {
  reportingCorrect = 0;
  reportingWrong = 0;
  reportingTotal = 0;
  reportingAnswered = false;
  reportingGameOver = false;

  document.getElementById("restartReportingBtn").style.display = "none";
  document.getElementById("reportingResult").innerText = "";
  document.getElementById("reportingFinal").innerText = "";

  updateReportingScore();
  prepareReportingSession();
  newReportingVerb();
}
