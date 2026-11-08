// renvoie vers la connexion si personne n'est connecté, et active le bouton déconnexion
verifierSession();
activerDeconnexion();

// éléments de la page
const liste = document.querySelector("#liste-contacts");
const formulaireAjout = document.querySelector("#form-ajout");
const champPseudo = document.querySelector("#pseudo-contact");
const messageErreur = document.querySelector("#messageErreur");

// fonction pour charger les contacts
async function chargerContacts() {
  // vide la liste avant de la réafficher (évite les doublons)
  liste.innerHTML = "";

  // récupère mes contacts + leur pseudo via le lien vers profils (RLS = seulement les miens)
  const { data: contacts, error } = await client
    .from("contacts")
    .select("contact_id, profils(pseudo)");

  // renvoie une erreur si supabase refuse la requête
  if (error) {
    messageErreur.textContent = error.message;
    return;
  }

  // aucun contact pour l'instant
  if (contacts.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucun contact, ajoutez-en un";
    liste.appendChild(li);
    return;
  }

  // pour chaque contact : créer une ligne avec son pseudo
  contacts.forEach((contact) => {
    const li = document.createElement("li");
    li.textContent = contact.profils.pseudo;
    // bouton pour retirer ce contact de ma liste
    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.addEventListener("click", async function () {
      // supprime la ligne de ce contact (la RLS limite aux miennes)
      const { error } = await client
        .from("contacts")
        .delete()
        .eq("contact_id", contact.contact_id);

      if (error) {
        messageErreur.textContent = error.message;
        return;
      }
      // recharge la liste à jour
      chargerContacts();
    });
    li.appendChild(boutonSupprimer);
    liste.appendChild(li);
  });
}

// ajout d'un contact par son pseudo
formulaireAjout.addEventListener("submit", async function (e) {
  e.preventDefault();
  messageErreur.textContent = "";

  const pseudo = champPseudo.value.trim();

  // mon identifiant
  const { data } = await client.auth.getSession();
  const monId = data.session.user.id;

  // cherche le profil qui a ce pseudo (null si aucun)
  const { data: profil, error: erreurProfil } = await client
    .from("profils")
    .select("id")
    .eq("pseudo", pseudo)
    .maybeSingle();

  // on vérifie les 3 cas d'erreur avant d'ajouter le contact
  if (erreurProfil) {
    messageErreur.textContent = erreurProfil.message;
    return;
  }
  if (!profil) {
    messageErreur.textContent = "Pseudo introuvable";
    return;
  }
  if (profil.id === monId) {
    messageErreur.textContent = "C'est vous";
    return;
  }

  // ajoute le contact (proprietaire_id rempli par Supabase)
  const { error } = await client
    .from("contacts")
    .insert({ contact_id: profil.id });

  // contrainte unique : déjà ajouté
  if (error) {
    messageErreur.textContent = "Ce contact est déjà dans votre liste";
    return;
  }
  // succès : on vide le champ et on recharge la liste
  champPseudo.value = "";
  chargerContacts();
});

// charge les contacts dès l'ouverture de la page
chargerContacts();
