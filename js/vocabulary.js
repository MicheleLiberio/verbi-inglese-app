async function getCurrentUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user;
}

async function refreshVocabularyUI() {
  const user = await getCurrentUser();

  const authBox = document.getElementById("authBox");
  const vocabularyApp = document.getElementById("vocabularyApp");

  if (!authBox || !vocabularyApp) return;

  if (user) {
    authBox.style.display = "none";
    vocabularyApp.style.display = "block";
    loadVocabularyWords();
  } else {
    authBox.style.display = "block";
    vocabularyApp.style.display = "none";
  }
}

async function signIn() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("authMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("authMessage").innerText = "";
  showSection("home");
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Errore: " + error.message);
    return;
  }

  showSection("loginPage");
}

async function addVocabularyWord() {
  const user = await getCurrentUser();

  if (!user) {
    document.getElementById("vocabularyMessage").innerText = "Devi effettuare il login.";
    return;
  }

  const italian = document.getElementById("italianWord").value.trim();
  const english = document.getElementById("englishWord").value.trim();

  if (!italian || !english) {
    document.getElementById("vocabularyMessage").innerText = "Inserisci entrambe le parole.";
    return;
  }

  const { error } = await supabaseClient
    .from("vocabulary_words")
    .insert({
      user_id: user.id,
      italian,
      english
    });

  if (error) {
    document.getElementById("vocabularyMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("vocabularyMessage").innerText = "Parola salvata.";
  document.getElementById("italianWord").value = "";
  document.getElementById("englishWord").value = "";

  loadVocabularyWords();
}

async function loadVocabularyWords() {
  const { data, error } = await supabaseClient
    .from("vocabulary_words")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("vocabularyList");

  if (!container) return;

  if (error) {
    container.innerHTML = "Errore: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nessuna parola salvata.</p>";
    return;
  }

  container.innerHTML = data.map(word => `
    <div class="history-card">
      <strong>${word.italian}</strong> → ${word.english}
      <br>
      <div class="vocabulary-actions">
        <button class="icon-button edit-button"
          onclick="editVocabularyWord('${word.id}', '${word.italian}', '${word.english}')">
          ✏️
        </button>

        <button class="icon-button delete-button"
          onclick="deleteVocabularyWord('${word.id}')">
          🗑️
        </button>
      </div>
    </div>
  `).join("");
}

async function editVocabularyWord(id, oldItalian, oldEnglish) {
  const italian = prompt("Modifica italiano:", oldItalian);
  const english = prompt("Modifica inglese:", oldEnglish);

  if (!italian || !english) return;

  const { error } = await supabaseClient
    .from("vocabulary_words")
    .update({
      italian: italian.trim(),
      english: english.trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    document.getElementById("vocabularyMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("vocabularyMessage").innerText = "Parola modificata.";
  loadVocabularyWords();
}

async function deleteVocabularyWord(id) {
  const confirmDelete = confirm("Vuoi davvero cancellare questa parola?");

  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("vocabulary_words")
    .delete()
    .eq("id", id);

  if (error) {
    document.getElementById("vocabularyMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("vocabularyMessage").innerText = "Parola cancellata.";
  loadVocabularyWords();
}

async function checkInitialAuth() {
  const user = await getCurrentUser();

  if (user) {
    showSection("home");
  } else {
    showSection("loginPage");
  }
}