verifierSession();
activerDeconnexion();


// fonction pour charger les contacts
async function chargerContacts() {
  // obtenir la session
  const { data } = await client.auth.getSession();
  // récupère mon identifiant
  const monId = data.session.user.id;

  // récupère tous les profils sauf le mien
  const { data: profils, error } = await client
    .from("profils")
    .select("id,pseudo")
    .neq("id", monId);

  // temporaire, pour tester
  console.log(profils, error);

  // récupère la liste <ul> de la page 
  const liste = document.querySelector("#liste-contacts");

  // pour chaque profil : créer une ligne, y mettre le pseudo, l'ajouter à la liste
  profils.forEach(profil => {
    const li = document.createElement("li");
    li.textContent = profil.pseudo;
    liste.appendChild(li);
  });

   // renvoie une erreur si supbase refuse la requete
  if (error) {
    messageErreur.textContent = error.message;
    return;
  }
}
// charge les contacts dès l'ouverture de la page
chargerContacts();