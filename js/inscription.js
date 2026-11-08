// si l'utilisateur est déjà connecté, on l'envoie directement à la messagerie

redirigerSiConnecte();


// Paragraphe où on affiche les messages d'erreur à l'utilisateur
const messageErreur = document.querySelector("#message-erreur");

// La variable contient le formulaire lui-même
const formulaire = document.querySelector("form");

// un écouteur sur le formulaire qui reagit a l'événement envoyer
formulaire.addEventListener("submit", async function (event) {
  // permet d'eviter le rechargement automatique du navigateur et permet l'execution de notre code
  event.preventDefault();

  // la valeur de ce que l'utilisateur a saisi dans les champs
  const pseudo = document.querySelector("#pseudo").value;
  const mdp = document.querySelector("#mdp").value;
  const email = document.querySelector("#email").value;
  const cmdp = document.querySelector("#cmdp").value;

  // verifie que les 2 mots de passes sont identiques
  messageErreur.textContent = "";
  if (mdp !== cmdp) {
    messageErreur.textContent = "Les 2 mots de passe ne correspondent pas.";
    return;
  }

  // envoie l'email et le mdp à Supabase pour créer le compte
  const { data, error } = await client.auth.signUp({ email: email, password: mdp });

  // renvoie une erreur si Supabase refuse la requete
  if (error) {
    messageErreur.textContent = error.message;
    return;
  }

  // insertion de l'id et pseudo de l'utilisateur dans la table profils
  const { error: erreurProfil } = await client
    .from("profils")
    .insert([{
      id: data.user.id,
      pseudo: pseudo,
    }]);

  // gere l'erreur de l'insertion
  if (erreurProfil) {
    messageErreur.textContent = erreurProfil.message;
    return;
  }

  // redirection vers la page conversation
  window.location.href = "conversation.html";
});
