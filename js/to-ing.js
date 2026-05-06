
let toIngCurrentCategory = "";
let toIngAnswered = false;
let toIngCorrect = 0;
let toIngWrong = 0;
let toIngTotal = 0;
let toIngGameOver = false;
let toIngSessionVerbs = [];
let toIngIndex = 0;

function prepareToIngSession() {
  toIngSessionVerbs = [];

  Object.keys(toIngVerbs).forEach(category => {
    toIngVerbs[category].forEach(verb => {
      toIngSessionVerbs.push({ verb, category });
    });
  });

  shuffleArray(toIngSessionVerbs);
  toIngIndex = 0;
}

function updateToIngScore() {
  document.getElementById("toIngCorrect").innerText = toIngCorrect;
  document.getElementById("toIngWrong").innerText = toIngWrong;
  document.getElementById("toIngTotal").innerText = toIngTotal;

  const percentage = toIngTotal === 0 ? 0 : Math.round((toIngCorrect / toIngTotal) * 100);
  document.getElementById("toIngPercentage").innerText = percentage + "%";
}

function setToIngButtons(disabled) {
  document.querySelectorAll(".toIngAnswer").forEach(btn => {
    btn.disabled = disabled;
  });
}

function newToIngVerb() {
  if (toIngGameOver) return;

  const item = toIngSessionVerbs[toIngIndex];
  toIngIndex++;

  toIngCurrentCategory = item.category;
  toIngAnswered = false;

  document.getElementById("toIngVerb").innerText = item.verb;
  document.getElementById("toIngResult").innerText = "";
  document.getElementById("toIngFinal").innerText = "";
  setToIngButtons(false);
}

function checkToIng(answer) {
  if (toIngAnswered || toIngGameOver) return;

  toIngAnswered = true;
  setToIngButtons(true);

  if (answer === toIngCurrentCategory) {
    document.getElementById("toIngResult").innerText = "😊";
    toIngCorrect++;
  } else {
    document.getElementById("toIngResult").innerText = "😢 Corretto: " + toIngLabels[toIngCurrentCategory];
    toIngWrong++;
  }

  toIngTotal++;
  updateToIngScore();

  if (toIngTotal >= MAX_QUESTIONS) {
    endToIngGame();
  } else {
    setTimeout(newToIngVerb, NEXT_DELAY);
  }
}

function endToIngGame() {
  toIngGameOver = true;

  saveHistory("toIng", toIngCorrect, toIngWrong, MAX_QUESTIONS);
  loadHistory("toIng");

  document.getElementById("toIngVerb").innerText = "Sessione completata";
  document.getElementById("restartToIngBtn").style.display = "inline-block";

  if (toIngCorrect === MAX_QUESTIONS) {
    document.getElementById("toIngFinal").innerText = "Perfetto! Hai fatto 10/10! 🎉";
    launchFireworks();
  } else {
    document.getElementById("toIngFinal").innerText = "Hai completato il quiz con " + toIngCorrect + "/10.";
  }
}

function restartToIng() {
  toIngCorrect = 0;
  toIngWrong = 0;
  toIngTotal = 0;
  toIngAnswered = false;
  toIngGameOver = false;

  document.getElementById("restartToIngBtn").style.display = "none";
  document.getElementById("toIngResult").innerText = "";
  document.getElementById("toIngFinal").innerText = "";

  updateToIngScore();
  prepareToIngSession();
  newToIngVerb();
}
