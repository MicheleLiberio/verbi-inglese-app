function renderIrregularTable() {
  const tableBody = document.getElementById("irregularTableBody");

  if (!tableBody) return;

  tableBody.innerHTML = irregularVerbs.map(verb => `
    <tr>
      <td>${verb.base}</td>
      <td>${verb.past}</td>
      <td>${verb.participle}</td>
    </tr>
  `).join("");
}

function getIrregularStats() {
  return JSON.parse(localStorage.getItem(IRREGULAR_STATS_KEY)) || {};
}

function saveIrregularStats(stats) {
  localStorage.setItem(IRREGULAR_STATS_KEY, JSON.stringify(stats));
}

function updateIrregularVerbStats(baseVerb, isCorrect) {
  const stats = getIrregularStats();

  if (!stats[baseVerb]) {
    stats[baseVerb] = {
      shown: 0,
      errors: 0
    };
  }

  stats[baseVerb].shown++;

  if (!isCorrect) {
    stats[baseVerb].errors++;
  }

  saveIrregularStats(stats);
}

function getSmartIrregularSession() {
  const stats = getIrregularStats();

  const weightedVerbs = irregularVerbs.map(verb => {
    const verbStats = stats[verb.base] || { shown: 0, errors: 0 };

    const priority =
      (verbStats.errors * 3) -
      verbStats.shown +
      Math.random();

    return {
      ...verb,
      priority
    };
  });

  return weightedVerbs
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_QUESTIONS);
}

let irrCurrentVerb = null;
let irrCorrect = 0;
let irrWrong = 0;
let irrTotal = 0;
let irrAnswered = false;
let irrGameOver = false;
let irregularSessionVerbs = [];
let irregularIndex = 0;

function prepareIrregularSession() {
  irregularSessionVerbs = getSmartIrregularSession();
  irregularIndex = 0;
}

function updateIrregularScore() {
  document.getElementById("irrCorrect").innerText = irrCorrect;
  document.getElementById("irrWrong").innerText = irrWrong;
  document.getElementById("irrTotal").innerText = irrTotal;

  const percentage = irrTotal === 0 ? 0 : Math.round((irrCorrect / irrTotal) * 100);
  document.getElementById("irrPercentage").innerText = percentage + "%";
}

function newIrregularVerb() {
  if (irrGameOver) return;

  irrCurrentVerb = irregularSessionVerbs[irregularIndex];
  irregularIndex++;
  irrAnswered = false;

  document.getElementById("irrVerb").innerText = irrCurrentVerb.base + " → ___ → ___";
  document.getElementById("pastInput").value = "";
  document.getElementById("participleInput").value = "";
  document.getElementById("irrResult").innerText = "";
  document.getElementById("irrFinal").innerText = "";
  document.getElementById("checkIrregularBtn").disabled = false;
  document.getElementById("pastInput").disabled = false;
  document.getElementById("participleInput").disabled = false;
  document.getElementById("pastInput").focus();
}

function checkIrregular() {
  if (irrAnswered || irrGameOver) return;

  const pastAnswer = document.getElementById("pastInput").value.trim().toLowerCase();
  const participleAnswer = document.getElementById("participleInput").value.trim().toLowerCase();

  const pastCorrect = pastAnswer === irrCurrentVerb.past;
  const participleCorrect = participleAnswer === irrCurrentVerb.participle;
  const isCorrect = pastCorrect && participleCorrect;

  updateIrregularVerbStats(irrCurrentVerb.base, isCorrect);

  irrAnswered = true;
  document.getElementById("checkIrregularBtn").disabled = true;
  document.getElementById("pastInput").disabled = true;
  document.getElementById("participleInput").disabled = true;

  if (isCorrect) {
    document.getElementById("irrResult").innerText = "😊 Corretto!";
    irrCorrect++;
  } else {
    document.getElementById("irrResult").innerText =
      "😢 Corretto: " + irrCurrentVerb.base + " → " + irrCurrentVerb.past + " → " + irrCurrentVerb.participle;
    irrWrong++;
  }

  irrTotal++;
  updateIrregularScore();

  if (irrTotal >= MAX_QUESTIONS) {
    endIrregularGame();
  } else {
    setTimeout(newIrregularVerb, NEXT_DELAY);
  }
}

function endIrregularGame() {
  irrGameOver = true;

  saveHistory("irregular", irrCorrect, irrWrong, MAX_QUESTIONS);
  loadHistory("irregular");

  document.getElementById("irrVerb").innerText = "Sessione completata";
  document.getElementById("restartIrregularBtn").style.display = "inline-block";
  document.getElementById("checkIrregularBtn").disabled = true;
  document.getElementById("pastInput").disabled = true;
  document.getElementById("participleInput").disabled = true;

  if (irrCorrect === MAX_QUESTIONS) {
    document.getElementById("irrFinal").innerText = "Perfetto! Hai fatto 10/10! 🎉";
    launchFireworks();
  } else {
    document.getElementById("irrFinal").innerText = "Hai completato il quiz con " + irrCorrect + "/10.";
  }
}

function restartIrregular() {
  irrCorrect = 0;
  irrWrong = 0;
  irrTotal = 0;
  irrAnswered = false;
  irrGameOver = false;

  document.getElementById("restartIrregularBtn").style.display = "none";
  document.getElementById("irrResult").innerText = "";
  document.getElementById("irrFinal").innerText = "";

  updateIrregularScore();
  prepareIrregularSession();
  newIrregularVerb();
}
