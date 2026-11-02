verifierSession();
activerDeconnexion();

let monID = null;
let contactActuel = null;
let maLangue = null;
const formulaire = document.querySelector("#formulaire");
const champSaisie = document.querySelector("#message");

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

    // renvoie une erreur si supabase refuse la requete
    if (error) {
    messageErreur.textContent = error.message;
    return;
  }

  // récupère la liste de la page 
  const liste = document.querySelector("#liste-conversations");

 // For...of = permet de faire des "await" pour chaque profil
  for (const profil of profils) {
    const li = document.createElement("li");

    const pseudo = document.createElement("strong");
    pseudo.textContent = profil.pseudo;
    li.appendChild(pseudo);

    const lastMessage = document.createElement("span");
    lastMessage.classList.add("apercu-message");
    lastMessage.textContent = "Chargement...";
    li.appendChild(lastMessage);

    // Requête pour récupérer le dernier message
    const { data: dernierMessage } = await client
      .from("messagerie")
      .select("contenu")
      .or(`and(expediteur_id.eq.${monID},destinataire_id.eq.${profil.id}),and(expediteur_id.eq.${profil.id},destinataire_id.eq.${monID})`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (dernierMessage && dernierMessage.length > 0) {
      lastMessage.textContent = dernierMessage[0].contenu;
    } else {
      lastMessage.textContent = "Aucune discussion";
    }

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
  };

  if (formulaire) {
    formulaire.addEventListener("submit", async function (event) {
        // 2. Empêcher le rechargement de la page par défaut
        event.preventDefault();

        // 3. Lire le texte et nettoyer les espaces
        const texteMessage = champSaisie.value.trim();

        // Si le champ est vide OU qu'aucun contact n'est sélectionné, on stoppe
        if (texteMessage === "" || !contactActuel) {
            return;
        }

        // 4. Insérer le message dans la base de données Supabase
        const { data: nouveauMessage, error } = await client
            .from("messagerie") 
            .insert([
                {
                    expediteur_id: monID,
                    destinataire_id: contactActuel,
                    contenu: texteMessage
                }
            ])
            .select()
            .single();

        // 5. Gérer l'erreur ou finaliser l'envoi
        if (error) {
            console.log("Erreur lors de l'envoi du message :", error);
            return;
        }

        // Vider le champ de saisie
        champSaisie.value = "";

        // Afficher immédiatement la bulle à l'écran
        afficherMessages(nouveauMessage);
    });
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

const recherche = document.querySelector("#contact-recherche");

if (recherche) {
    recherche.addEventListener("input", function (event) {
        const contact = event.target.value.toLowerCase();
        const liste_contact = document.querySelectorAll("#liste-conversations li");
        liste_contact.forEach(li => {
            const pseudo = li.textContent.toLowerCase();
            if (pseudo.includes(contact)) {
                li.style.display = "";
            } else {
                li.style.display = "none";
            }
        });
    });
}
