verifierSession();
activerDeconnexion();

let monID = null;
let contactActuel = null;
let maLangue = null;


async function MaSession() {
  const { data } = await client.auth.getSession();
  monID = data.session.user.id;

    // récupère seulement mon profil
  const { data: profil} = await client
    .from("profils")
    .select("langue")
    .eq("id", monID)
    .single(); // une seul le ligne pas tout le tableau

  maLangue = profil.langue;

  // récupère tous les profils sauf le mien
  const { data: profils, error } = await client
    .from("profils")
    .select("id,pseudo")
    .neq("id", monID);

  // temporaire, pour tester
  console.log(profils, error);

  // récupère la liste de la page 
  const liste = document.querySelector("#liste-conversations");

  // pour chaque profil : créer une ligne, y mettre le pseudo, l'ajouter à la liste
  profils.forEach(profil => {
    const li = document.createElement("li");
    li.textContent = profil.pseudo;
    li.addEventListener("click", async() => {
      contactActuel = profil.id;
      const destinataire = document.querySelector("#destinataire-titre");
      destinataire.textContent = profil.pseudo;

      const historique = document.querySelector("#historique-messages")
      historique.innerHTML = ""
      
    const filtre = `and(expediteur_id.eq.${monID},destinataire_id.eq.${contactActuel}),and(expediteur_id.eq.${contactActuel},destinataire_id.eq.${monID})`;
  // récupère tous les messages entre l'expediteur et le destinataire
     const { data: messages, error } = await client
    .from("messagerie")
    .select("*")
    .or(filtre)
    .order("created_at", { ascending: true });
    
    console.log(messages, error);

    messages.forEach(message => {
      afficherMessages(message);
    });

    });
    liste.appendChild(li);
  });

   // renvoie une erreur si supbase refuse la requete
  if (error) {
    messageErreur.textContent = error.message;
    return;
  }
}

function afficherMessages(message) {

    const liste = document.querySelector("#historique-messages");

    const div = document.createElement("div");
    div.classList.add("bulle");

    if (message.expediteur_id === monID) {
        div.classList.add("message-envoye");
    } else {
        div.classList.add("message-recu");
    }

    const texte = document.createElement("p");
    texte.textContent = message.contenu;
    div.appendChild(texte);

    const btnTrad = document.createElement("button");
    btnTrad.classList.add("traduire");
    btnTrad.textContent = "Traduire";
    div.appendChild(btnTrad);
    
    btnTrad.addEventListener("click", async function (event) {
    const traduction = await traduire(message.contenu, maLangue);
    texte.textContent = traduction;
});

    
    

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("date");
    dateSpan.textContent = formaterDate(message.created_at);
    div.appendChild(dateSpan);

    liste.appendChild(div);


    const defilement = document.querySelector("#messages");
    defilement.scrollTop = defilement.scrollHeight;
}

function formaterDate(date) {
    const dateObj = new Date(date);
    // Formate la date actuelle
    return dateObj.toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

MaSession();
