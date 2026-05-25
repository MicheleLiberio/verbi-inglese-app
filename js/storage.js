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

  if (!user) return null;

  const percentage = Math.round((correct / total) * 100);

  const { data, error } = await supabaseClient
    .from("exercise_sessions")
    .insert({
      user_id: user.id,
      exercise_type: type,
      correct,
      wrong,
      total,
      percentage
    })
    .select()
    .single();

  if (error) {
    console.error("Errore salvataggio sessione:", error.message);
    return null;
  }

  return data.id;
}

async function saveExerciseAnswers(sessionId, type, answers) {
  const user = await getCurrentUser();

  if (!user || !sessionId || !answers || answers.length === 0) return;

  const payload = answers.map(answer => ({
    user_id: user.id,
    session_id: sessionId,
    exercise_type: type,
    question: answer.question,
    correct_answer: answer.correct_answer,
    user_answer: answer.user_answer,
    is_correct: answer.is_correct
  }));

  const { error } = await supabaseClient
    .from("exercise_answers")
    .insert(payload);

  if (error) {
    console.error("Errore salvataggio risposte:", error.message);
  }
}

async function loadToIngReviewStats() {
  const container = document.getElementById("toIngReviewStats");

  if (!container) return;

  const user = await getCurrentUser();

  if (!user) {
    container.innerHTML = "<p>Effettua il login per vedere i dati.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("exercise_answers")
    .select("question, is_correct")
    .eq("exercise_type", "toIng");

  if (error) {
    container.innerHTML = "Errore caricamento dati: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nessun dato disponibile.</p>";
    return;
  }

  const stats = {};

  data.forEach(item => {
    if (!stats[item.question]) {
      stats[item.question] = {
        shown: 0,
        errors: 0
      };
    }

    stats[item.question].shown++;

    if (!item.is_correct) {
      stats[item.question].errors++;
    }
  });

  const sorted = Object.keys(stats)
    .map(verb => {
      const shown = stats[verb].shown;
      const errors = stats[verb].errors;
      const correct = shown - errors;
      const percentage = Math.round((correct / shown) * 100);

      return {
        verb,
        shown,
        errors,
        correct,
        percentage
      };
    })
    .filter(item => item.errors > 0)
    .sort((a, b) => {
      if (b.errors !== a.errors) return b.errors - a.errors;
      return a.percentage - b.percentage;
    })
    .slice(0, 10);

  if (sorted.length === 0) {
    container.innerHTML = "<p>Nessun verbo problematico. Ottimo lavoro!</p>";
    return;
  }

  container.innerHTML = sorted.map(item => `
    <div class="history-card">
      <strong>${item.verb}</strong>
      <br>
      Corrette: ${item.correct} |
      Errori: ${item.errors}
      <br>
      Percentuale: ${item.percentage}%
    </div>
  `).join("");
}

function exportLocalData() {
  const data = {
    localStorage: { ...localStorage }
  };

  const text = JSON.stringify(data, null, 2);

  navigator.clipboard.writeText(text);

  alert("Dati copiati negli appunti");
}