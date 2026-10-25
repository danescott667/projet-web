// Vérifie qu'un utilisateur est connecté, sinon renvoie vers la page de connexion
async function verifierSession() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // non connecté -> page de connexion
  if (!data.session) {
    window.location.href = "index.html";
  }
}

// Branche le bouton se déconnecter  à appeler sur les pages connectées
function activerDeconnexion() {
  // la variable contient le bouton se déconnecter
  const boutonDeconnexion = document.querySelector("#deconnexion");

  // un écouteur sur le bouton se déconnecter qui réagit au clic
  boutonDeconnexion.addEventListener("click", async function (event) {
    // supprime la session en cours
    await client.auth.signOut();

    // redirection vers la page de connexion
    window.location.href = "index.html";
  });
}

// Renvoie vers l’application si l’utilisateur est déjà connecté
// à appeler sur les pages de connexion et d’inscription

async function redirigerSiConnecte() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // connecté -> page de conversation
  if (data.session) {
    window.location.href = "conversation.html";
  }
}
