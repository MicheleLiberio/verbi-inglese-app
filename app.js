// app.js
const MAX_QUESTIONS = 10;
const NEXT_DELAY = 1400;
const STORAGE_KEY = "englishTrainerHistory";
const IRREGULAR_STATS_KEY = "irregularVerbStats";

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  if (sectionId === "toIngPractice") {
    restartToIng();
    loadHistory("toIng");
  }

  if (sectionId === "irregularPractice") {
    restartIrregular();
    loadHistory("irregular");
  }
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function saveHistory(type, correct, wrong, total) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  history.push({
    type,
    correct,
    wrong,
    total,
    percentage: Math.round((correct / total) * 100),
    date: new Date().toLocaleString()
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadHistory(type) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const filtered = history.filter(item => item.type === type);
  const targetId = type === "toIng" ? "toIngHistory" : "irregularHistory";
  const container = document.getElementById(targetId);

  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = "<p>Nessun risultato salvato.</p>";
    return;
  }

  container.innerHTML = filtered.slice().reverse().map(item => `
    <div class="history-card">
      <strong>${item.correct}/${item.total}</strong> (${item.percentage}%)
      <br>
      <small>${item.date}</small>
    </div>
  `).join("");
}

/* ---------------- TO / ING ---------------- */

const toIngVerbs = {
  to: ["agree","appear","choose","decide","expect","hope","learn","manage","offer","promise","refuse","seem","tend","threaten","want"],
  ing: ["admit","avoid","bother","deny","dislike","enjoy","finish","get round to","imagine","insist on","keep (on)","mind","miss","suggest"],
  both: ["begin","continue","start"],
  change: ["forget","go on","remember","stop","try"]
};

const toIngLabels = {
  to: "TO + infinitive",
  ing: "-ing",
  both: "TO o -ing",
  change: "Cambio significato"
};

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

/* ---------------- IRREGULAR VERBS ---------------- */

const irregularVerbs = [
  { base: "break", past: "broke", participle: "broken" },
  { base: "bring", past: "brought", participle: "brought" },
  { base: "broadcast", past: "broadcast", participle: "broadcast" },
  { base: "build", past: "built", participle: "built" },
  { base: "choose", past: "chose", participle: "chosen" },
  { base: "cost", past: "cost", participle: "cost" },
  { base: "cut", past: "cut", participle: "cut" },
  { base: "deal", past: "dealt", participle: "dealt" },
  { base: "draw", past: "drew", participle: "drawn" },
  { base: "fly", past: "flew", participle: "flown" },
  { base: "forget", past: "forgot", participle: "forgotten" },
  { base: "grow", past: "grew", participle: "grown" },
  { base: "hear", past: "heard", participle: "heard" },
  { base: "hit", past: "hit", participle: "hit" },
  { base: "hold", past: "held", participle: "held" },
  { base: "mean", past: "meant", participle: "meant" },
  { base: "pay", past: "paid", participle: "paid" },
  { base: "rise", past: "rose", participle: "risen" },
  { base: "say", past: "said", participle: "said" },
  { base: "shake", past: "shook", participle: "shaken" },
  { base: "sing", past: "sang", participle: "sung" },
  { base: "sink", past: "sank", participle: "sunk" },
  { base: "sleep", past: "slept", participle: "slept" },
  { base: "spend", past: "spent", participle: "spent" },
  { base: "spill", past: "spilt", participle: "spilt" },
  { base: "steal", past: "stole", participle: "stolen" },
  { base: "swear", past: "swore", participle: "sworn" },
  { base: "teach", past: "taught", participle: "taught" },
  { base: "tell", past: "told", participle: "told" },
  { base: "wear", past: "wore", participle: "worn" },
  { base: "win", past: "won", participle: "won" }
];

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

/* ---------------- FIREWORKS ---------------- */

function launchFireworks() {
  const canvas = document.getElementById("fireworksCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  for (let i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.random() * 3 + 2,
      dx: (Math.random() - 0.5) * 10,
      dy: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.015;

      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.alpha > 0);

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("fireworksCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

renderIrregularTable();
