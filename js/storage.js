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

async function saveSessionToSupabase(type, correct, wrong, total) {
  const user = await getCurrentUser();

  if (!user) return;

  const percentage = Math.round((correct / total) * 100);

  const { error } = await supabaseClient
    .from("exercise_sessions")
    .insert({
      user_id: user.id,
      exercise_type: type,
      correct,
      wrong,
      total,
      percentage
    });

  if (error) {
    console.error("Errore salvataggio sessione:", error.message);
  }
}

function exportLocalData() {
  const data = {
    localStorage: { ...localStorage }
  };

  const text = JSON.stringify(data, null, 2);

  navigator.clipboard.writeText(text);

  alert("Dati copiati negli appunti");
}
