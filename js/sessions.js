// Vérifie qu’un utilisateur est connecté, sinon renvoie vers la page de connexion
async function verifierSession() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // non non connecté -> page de connexion
  if (!data.session) {
    window.location.href = "index.html";
  }
}
// Lance la vérification dès le chargement de la page
verifierSession();
