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

  let targetId;
  if (type === "toIng") targetId = "toIngHistory";
  if (type === "irregular") targetId = "irregularHistory";
  if (type === "reporting") targetId = "reportingHistory";

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
