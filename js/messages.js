verifierSession();
activerDeconnexion();

let monID = null;
let salonActuel = null;
let maLangue = null;
const formulaire = document.querySelector("#formulaire");
const champSaisie = document.querySelector("#message");
const elementsSalons = {};

async function MaSession() {
    const { data } = await client.auth.getSession();
    monID = data.session.user.id;

    // récupère seulement mon profil
    const { data: profil } = await client
        .from("profils")
        .select("langue")
        .eq("id", monID)
        .single(); // une seul le ligne pas tout le tableau

    maLangue = profil.langue;

  // récupère tous les salons
const { data: salons, error } = await client
    .from("salons")
    .select("id,nom");

    // renvoie une erreur si supabase refuse la requete
    if (error) {
    console.log("Erreur chargement profils :", error.message);
    return;
    }

    // récupère la liste de la page 
    const liste = document.querySelector("#liste-conversations");

 // For...of = permet de faire des "await" pour chaque profil
  for (const salon of salons) {
    const li = document.createElement("li");

    elementsSalons[salon.id] = li;

    const nom = document.createElement("strong");
    nom.textContent = salon.nom;
    li.appendChild(nom);

    const lastMessage = document.createElement("span");
    lastMessage.classList.add("apercu-message");
    li.appendChild(lastMessage);

    // Requête pour récupérer le dernier message
    const { data: dernierMessage } = await client
      .from("messagerie")
      .select("contenu, expediteur_id, profils(pseudo)")
      .eq("Salon_id", salon.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (dernierMessage && dernierMessage.length > 0) {
      const msg = dernierMessage[0];
      const prop = (msg.expediteur_id == monID);
      const pseudoAuteur = msg.profils ? msg.profils.pseudo : "";
      mettreAJourApercu(salon.id, msg.contenu, pseudoAuteur, prop);
    } else {
      mettreAJourApercu(salon.id, "Aucune conversation", pseudoAuteur, false);
    }

        li.addEventListener("click", async () => {

            li.classList.remove("non-lu");

      salonActuel = salon.id;
      const destinataire = document.querySelector("#salon-titre");
      destinataire.textContent = salon.nom;

      const historique = document.querySelector("#historique-messages")
      historique.innerHTML = ""
  // récupère tous les messages de ce salon
     const { data: messages, error } = await client
    .from("messagerie")
    .select("*, profils(pseudo)")
    .eq("Salon_id", salon.id)
    .order("created_at", { ascending: true });

            if (error) {
                console.log("Erreur lors du chargement des messages :", error);
                return;
            }

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

        // Si le champ est vide OU qu'aucun salon n'est sélectionné, on stoppe
        if (texteMessage === "" || !salonActuel) {
            return;
        }

        // 4. Insérer le message dans la base de données Supabase
        const { data: nouveauMessage, error } = await client
            .from("messagerie") 
            .insert([
                {
                    expediteur_id: monID,
                    Salon_id: salonActuel,
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

            mettreAJourApercu(salonActuel, nouveauMessage.contenu, "Vous",true);
    });
    }

    client
    .channel("message-canal")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "messagerie",
        },
        async (payload) => {
            const messageRecu = payload.new;
            const estMoi = messageRecu.expediteur_id === monID;
            
            // Récupérer le pseudo de l'expéditeur
            const { data: p } = await client
                .from("profils")
                .select("pseudo")
                .eq("id", messageRecu.expediteur_id)
                .single();
            
            const pseudo = p ? p.pseudo : "Inconnu";
              
            mettreAJourApercu(messageRecu.Salon_id, messageRecu.contenu, pseudo, estMoi);
            
            if (salonActuel === messageRecu.Salon_id) {
                messageRecu.profils = { pseudo: pseudo };
                afficherMessages(messageRecu);
            } else {
                // Marquer le contact comme non lu
                if (!estMoi) {
                    const salonConcerne = elementsSalons[messageRecu.Salon_id];
                    if (salonConcerne) {
                        salonConcerne.classList.add("non-lu");
                    }
                }
            }
        }
    )
    .subscribe();
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

    const pseudo = document.createElement("strong");
    pseudo.textContent = message.expediteur_id === monID ? "Vous" : message.profils.pseudo;
    div.appendChild(pseudo);

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

function mettreAJourApercu(idSalon, messagestext, pseudoText, moi) {
    const salon_Concerne = elementsSalons[idSalon];
    if (salon_Concerne) {
        const apercuMessage = salon_Concerne.querySelector(".apercu-message");
        const pseudo = salon_Concerne.querySelector("strong");

        if (apercuMessage) {
            if (moi){
                apercuMessage.textContent = "Vous: " + messagestext;
            }else{
                apercuMessage.textContent = pseudoText + ": " + messagestext;
            }
        }
        const li = document.querySelector("#liste-conversations");
        li.prepend(salon_Concerne);
        }
}

MaSession();

const recherche = document.querySelector("#salon-recherche");

if (recherche) {
    recherche.addEventListener("input", function (event) {
        const salon = event.target.value.toLowerCase();
        const liste_salon = document.querySelectorAll("#liste-conversations li");
        liste_salon.forEach(li => {
            const elementPseudo = li.querySelector("strong");
            const pseudo = elementPseudo ? elementPseudo.textContent.toLowerCase() : "";
            if (pseudo.includes(salon)) {
                li.style.display = "";
            } else {
                li.style.display = "none";
            }
        });
    });
}


