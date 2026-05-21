let editingVocabularyId = null;
let deletingVocabularyId = null;
let selectedVocabularyWord = null;

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
  closeAddVocabularyModal();

  loadVocabularyWords();
}

let vocabularyWords = [];

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

  vocabularyWords = data || [];

  if (vocabularyWords.length === 0) {    
    container.innerHTML = "<p>Nessuna parola salvata.</p>";
    return;
  }

  renderVocabularyList(vocabularyWords);
}

function renderVocabularyList(words) {
  const container = document.getElementById("vocabularyList");

  if (!container) return;

  if (!words || words.length === 0) {
    container.innerHTML = "<p>Nessuna parola trovata.</p>";
    return;
  }

  container.innerHTML = `
    <div class="vocabulary-grid">
      ${words.map(word => {
        const shown = Number(word.shown) || 0;
        const ok = Number(word.ok_count) || 0;
        const ko = Number(word.ko_count) || 0;

        return `
          <div class="vocabulary-tile" onclick="openVocabularyDetailModal('${word.id}')">
            <div class="vocabulary-tile-english">${word.english}</div>
            <div class="vocabulary-tile-italian">${word.italian}</div>
            <div class="vocabulary-tile-stats">
              Ripassi: ${shown} | OK: ${ok} | KO: ${ko}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function openVocabularyDetailModal(id) {
  selectedVocabularyWord = vocabularyWords.find(
    word => String(word.id) === String(id)
  );

  if (!selectedVocabularyWord) return;

  const shown = Number(selectedVocabularyWord.shown) || 0;
  const ok = Number(selectedVocabularyWord.ok_count) || 0;
  const ko = Number(selectedVocabularyWord.ko_count) || 0;

  document.getElementById("detailEnglishWord").innerText = selectedVocabularyWord.english;
  document.getElementById("detailItalianWord").innerText = selectedVocabularyWord.italian;

  document.getElementById("detailVocabularyStats").innerHTML = `
    <p>Ripassi: <strong>${shown}</strong></p>
    <p>OK: <strong>${ok}</strong> | KO: <strong>${ko}</strong></p>
  `;

  document.getElementById("vocabularyDetailModal").style.display = "flex";
}

function closeVocabularyDetailModal() {
  selectedVocabularyWord = null;
  document.getElementById("vocabularyDetailModal").style.display = "none";
}

function editSelectedVocabularyWord() {
  if (!selectedVocabularyWord) return;

  const wordToEdit = selectedVocabularyWord;

  closeVocabularyDetailModal();

  editVocabularyWord(
    wordToEdit.id,
    wordToEdit.italian,
    wordToEdit.english
  );
}

function deleteSelectedVocabularyWord() {
  if (!selectedVocabularyWord) return;

  const wordToDelete = selectedVocabularyWord;

  closeVocabularyDetailModal();

  deleteVocabularyWord(wordToDelete.id);
}

function filterVocabularyWords() {
  const search = document
    .getElementById("vocabularySearch")
    .value
    .trim()
    .toLowerCase();

  if (search.length < 3) {
    renderVocabularyList(vocabularyWords);
    return;
  }

  const filtered = vocabularyWords.filter(word =>
    word.italian.toLowerCase().includes(search) ||
    word.english.toLowerCase().includes(search)
  );

  renderVocabularyList(filtered);
}

function editVocabularyWord(id, oldItalian, oldEnglish) {
  editingVocabularyId = id;

  document.getElementById("editItalianWord").value = oldItalian;
  document.getElementById("editEnglishWord").value = oldEnglish;

  document.getElementById("editVocabularyModal").style.display = "flex";
}

function closeEditVocabularyModal() {
  editingVocabularyId = null;
  document.getElementById("editVocabularyModal").style.display = "none";
}

async function confirmEditVocabularyWord() {
  if (!editingVocabularyId) return;

  const italian = document.getElementById("editItalianWord").value.trim();
  const english = document.getElementById("editEnglishWord").value.trim();

  if (!italian || !english) {
    document.getElementById("vocabularyMessage").innerText =
      "Inserisci entrambe le parole.";
    return;
  }

  const { error } = await supabaseClient
    .from("vocabulary_words")
    .update({
      italian,
      english,
      updated_at: new Date().toISOString()
    })
    .eq("id", editingVocabularyId);

  if (error) {
    document.getElementById("vocabularyMessage").innerText =
      "Errore: " + error.message;
    return;
  }

  document.getElementById("vocabularyMessage").innerText = "Parola modificata.";

  closeEditVocabularyModal();
  loadVocabularyWords();
}

function deleteVocabularyWord(id) {
  deletingVocabularyId = id;
  document.getElementById("deleteVocabularyModal").style.display = "flex";
}

function closeDeleteVocabularyModal() {
  deletingVocabularyId = null;
  document.getElementById("deleteVocabularyModal").style.display = "none";
}

async function confirmDeleteVocabularyWord() {
  if (!deletingVocabularyId) return;

  const { error } = await supabaseClient
    .from("vocabulary_words")
    .delete()
    .eq("id", deletingVocabularyId);

  if (error) {
    document.getElementById("vocabularyMessage").innerText =
      "Errore: " + error.message;
    return;
  }

  document.getElementById("vocabularyMessage").innerText = "Parola cancellata.";

  closeDeleteVocabularyModal();
  loadVocabularyWords();
}

function openAddVocabularyModal() {
  document.getElementById("italianWord").value = "";
  document.getElementById("englishWord").value = "";
  document.getElementById("addVocabularyModal").style.display = "flex";
}

function closeAddVocabularyModal() {
  document.getElementById("addVocabularyModal").style.display = "none";
}

async function checkInitialAuth() {
  const user = await getCurrentUser();

  if (user) {
    showSection("home");
  } else {
    showSection("loginPage");
  }
}