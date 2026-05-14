async function signUp() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    document.getElementById("authMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("authMessage").innerText =
    "Registrazione completata. Controlla la tua email se richiesta.";
}

async function signIn() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("authMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("authMessage").innerText = "Login effettuato.";
}

async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    document.getElementById("authMessage").innerText = "Errore: " + error.message;
    return;
  }

  document.getElementById("authMessage").innerText = "Logout effettuato.";
}
