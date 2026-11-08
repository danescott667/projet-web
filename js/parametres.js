// renvoie vers la connexion si personne n'est connecté, et active le bouton déconnexion
verifierSession();
activerDeconnexion();

// Paragraphe où on affiche les messages d'erreur à l'utilisateur
const messageErreur = document.querySelector("#message-erreur");

// Paragraphe où on affiche les messages  à succes de l'utilisateur
const messageSucces = document.querySelector("#message-succes");

// fonction pour charger la langue
async function chargerLangue() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // récupère mon identifiant
  const monId = data.session.user.id;

  // récupère seulement mon profil
  const { data: profil, error } = await client
    .from("profils")
    .select("langue")
    .eq("id", monId)
    .single(); // une seule ligne pas tout le tableau

  // renvoie une erreur si Supabase refuse la requete
  if (error) {
    messageErreur.textContent = error.message;
    return;
  }

  // affiche la langue enregistrée dans le menu déroulant
  document.querySelector("#langue").value = profil.langue;
}

// charge la langue
chargerLangue();

// La variable contient le formulaire lui-même
const formulaire = document.querySelector("form");
// un écouteur sur le formulaire qui reagit a l'événement envoyer
formulaire.addEventListener("submit", async function (event) {
  // permet d'eviter le rechargement automatique du navigateur et permet l'execution de notre code
  event.preventDefault();
  messageErreur.textContent = "";
  messageSucces.textContent = "";

  // la langue choisie dans le menu déroulant
  const langue = document.querySelector("#langue").value;

  // obtenir la session
  const { data } = await client.auth.getSession();

  // récupère mon identifiant
  const monId = data.session.user.id;

  // enregistre la nouvelle langue dans mon profil
  const { error } = await client

    .from("profils")
    .update({ langue: langue })
    .eq("id", monId);

  // renvoie une erreur si Supabase refuse la requete
  if (error) {
    messageErreur.textContent = error.message;
  } else {
    messageSucces.textContent = "Langue enregistrée";
  }
});
