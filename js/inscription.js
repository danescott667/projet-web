// Paragraphe où on affiche les messages d'erreur à l'utilisateur
const messageErreur = document.querySelector("#message-erreur");

// La variable contient le formulaire lui-même
const formulaire = document.querySelector("form");

// un ecouteur sur le formulaire qui reagit a l'evennement envoyer
formulaire.addEventListener("submit", async function (event) {
  // permet d'eviter le rechargement automatique du navigateur et permet l'execution de notre code
  event.preventDefault();

  // la valeur de ce que l'utilisateur a saisi dans les champs
  const pseudo = document.querySelector("#pseudo").value;
  const mdp = document.querySelector("#mdp").value;
  const email = document.querySelector("#email").value;
  const cmdp = document.querySelector("#cmdp").value;

  // temporaire pour avoir un affichage dans la console
  console.log(pseudo);
  console.log(mdp);
  console.log(email);
  console.log(cmdp);

  // verifie que les 2 mots de passes sont identiques
  messageErreur.textContent = "";
  if (mdp !== cmdp) {
    messageErreur.textContent = "Les 2 mots de passe ne correspondent pas.";
    return;
  }

  // envoies l'email et le mdp à Supabase pour créer le compte
  const { data, error } = await client.auth.signUp({ email: email, password: mdp });

  // temporaire pour les tests
  console.log(data, error);

  // renvoie une erreur si supbase refuse la requete
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
