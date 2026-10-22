// Vérifie qu'un utilisateur est connecté, sinon renvoie vers la page de connexion
async function verifierSession() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // non connecté -> page de connexion
  if (!data.session) {
    window.location.href = "index.html";
  }
}
// Lance la vérification dès le chargement de la page
verifierSession();

// la variable contient le bouton se déconnecter
const boutonDeconnexion = document.querySelector("#deconnexion");

// un écouteur sur le bouton se déconnecter qui réagit au clic
boutonDeconnexion.addEventListener("click", async function (event) {
  // supprime la session en cours
  await client.auth.signOut();

  // redirection vers la page de connexion
  window.location.href = "index.html";
});