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

async function loadHistory(type) {
  let targetId;

  if (type === "toIng") targetId = "toIngHistory";
  if (type === "irregular") targetId = "irregularHistory";
  if (type === "reporting") targetId = "reportingHistory";

  const container = document.getElementById(targetId);

  if (!container) return;

  const user = await getCurrentUser();

  if (!user) {
    container.innerHTML = "<p>Effettua il login per vedere lo storico.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("exercise_sessions")
    .select("*")
    .eq("exercise_type", type)
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = "Errore caricamento storico: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nessun risultato salvato.</p>";
    return;
  }

  container.innerHTML = data.map(item => `
    <div class="history-card">
      <strong>${item.correct}/${item.total}</strong> (${item.percentage}%)
      <br>
      <small>${new Date(item.created_at).toLocaleString()}</small>
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
