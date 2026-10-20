// Paragraphe où on affiche les messages d'erreur à l'utilisateur
const mdpMessageErreur = document.querySelector("#message-erreur");

// La variable contient le formulaire lui-même
const formulaire = document.querySelector("form");

// un ecouteur sur le formulaire qui reagit a l'evennement envoyer
formulaire.addEventListener("submit", function (event) {
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
  mdpMessageErreur.textContent = "";
  if (mdp !== cmdp) {
    mdpMessageErreur.textContent = "Les 2 mots de passe ne correspondent pas.";
    return;
  }
});
