// Vérification de la session et initialisation des fonctions de déconnexion
verifierSession();
activerDeconnexion();

// Déclaration des variables globales
let monID = null;
let salonActuel = null;
let maLangue = null;
const formulaire = document.querySelector("#formulaire");
const champSaisie = document.querySelector("#message");
const elementsSalons = {}; // Dictionnaire pour associer l'ID d'un salon à son élément HTML

// Fonction principale asynchrone qui charge l'utilisateur, les salons et écoute les messages en temps réel
async function MaSession() {

    // Récupération de la session active de l'utilisateur connecté via Supabase Auth
    const { data } = await client.auth.getSession();
    monID = data.session.user.id;

    // récupère seulement mon profil
    const { data: profil } = await client
        .from("profils")
        .select("langue")
        .eq("id", monID)
        .single(); // une seule ligne pas tout le tableau

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

    // Récupère le conteneur de la liste des conversations dans le DOM
    const liste = document.querySelector("#liste-conversations");

 // For...of = permet de faire des "await" pour chaque profil
  for (const salon of salons) {
    const li = document.createElement("li");

    // Stocke la référence du <li> dans le dictionnaire global
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

    // Si un message existe, on met à jour l'aperçu avec son contenu sinon on indique qu'il n'y a rien
    if (dernierMessage && dernierMessage.length > 0) {
      const msg = dernierMessage[0];
      const prop = (msg.expediteur_id == monID);
      const pseudoAuteur = msg.profils ? msg.profils.pseudo : "";
      mettreAJourApercu(salon.id, msg.contenu, pseudoAuteur, prop);
    } else {
      mettreAJourApercu(salon.id, "Aucune conversation", "", false);
    }

    // Écouteur de clic sur un salon de la liste pour l'ouvrir et charger ses messages
    li.addEventListener("click", async () => {

      li.classList.remove("non-lu");

      salonActuel = salon.id;
      const destinataire = document.querySelector("#salon-titre");
      destinataire.textContent = salon.nom;

      const historique = document.querySelector("#historique-messages")
      historique.innerHTML = "" // Vide l'historique affiché à l'écran

  // récupère tous les messages de ce salon dans l'ordre chronologique
     const { data: messages, error } = await client
    .from("messagerie")
    .select("*, profils(pseudo)")
    .eq("Salon_id", salon.id)
    .order("created_at", { ascending: true });

    if (error) {
        console.log("Erreur lors du chargement des messages :", error);
        return;
    }

    // Affiche chaque message 
    messages.forEach(message => {
        afficherMessages(message);
    });

    });

    // Ajoute le <li> construit dans la liste HTML des conversations
    liste.appendChild(li);
    };

    
    // 1. Récupérer les éléments de la fenêtre et du bouton
    const fenetre = document.querySelector("#fenetre-salon");
    const btnOuvrir = document.querySelector(".creer-salon");
    const btnAnnuler = document.querySelector("#btn-annuler");
    const inputNomSalon = document.querySelector("#nom-nouveau-salon");
    const formSalon = document.querySelector("#form-salon");

    // 2. Ouvrir la fenêtre au clic sur "Créer un salon"
    if (btnOuvrir) {
        btnOuvrir.addEventListener("click", () => {
            inputNomSalon.value = ""; // Vider le champ à l'ouverture
            fenetre.showModal();        // Ouvre la boîte de dialogue
        });
    }

    // 3. Fermer la fenêtre si on clique sur "Annuler"
    if (btnAnnuler) {
        btnAnnuler.addEventListener("click", () => {
            fenetre.close();
        });
    }

    // 4. Valider le formulaire de la modale (Créer le salon dans Supabase)
    if (formSalon) {
        formSalon.addEventListener("submit", async (event) => {
            event.preventDefault();
            const nomSalon = inputNomSalon.value.trim();

            if (!nomSalon) return;

            // Insertion dans la base de données Supabase
            const { data: nouveauSalon, error } = await client
                .from("salons")
                .insert([{ nom: nomSalon }])
                .select()
                .single();

            if (error) {
                console.log("Erreur lors de la création du salon :", error.message);
                return;
            }

            // Fermer la fenêtre
            fenetre.close();

            // Créer dynamiquement le <li> dans la liste de gauche pour l'afficher tout de suite
            const liste = document.querySelector("#liste-conversations");
            const li = document.createElement("li");
            elementsSalons[nouveauSalon.id] = li;

            const nom = document.createElement("strong");
            nom.textContent = nouveauSalon.nom;
            li.appendChild(nom);

            const lastMessage = document.createElement("span");
            lastMessage.classList.add("apercu-message");
            li.appendChild(lastMessage);

            // Ajouter l'écouteur de clic pour pouvoir ouvrir ce nouveau salon
            li.addEventListener("click", async () => {
                li.classList.remove("non-lu");
                salonActuel = nouveauSalon.id;
                document.querySelector("#salon-titre").textContent = nouveauSalon.nom;
                
                const historique = document.querySelector("#historique-messages");
                historique.innerHTML = "";

                const { data: messages, error } = await client
                    .from("messagerie")
                    .select("*, profils(pseudo)")
                    .eq("Salon_id", nouveauSalon.id)
                    .order("created_at", { ascending: true });

                if (error) {
                    console.log("Erreur chargement messages :", error);
                    return;
                }

                messages.forEach(message => {
                    afficherMessages(message);
                });
            });

            liste.appendChild(li);
            mettreAJourApercu(nouveauSalon.id, "Aucune conversation", "", false);
        });
    }

    // Gestion de l'envoi de messages
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

    // --- TEMPS RÉEL (SUPABASE REALTIME) ---
    // Écoute les insertions de nouveaux messages en direct sur la base de données
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
            
            // Met à jour l'aperçu du salon concerné dans la colonne de gauche
            mettreAJourApercu(messageRecu.Salon_id, messageRecu.contenu, pseudo, estMoi);
            
            // Si l'utilisateur est actuellement dans le salon qui reçoit le message, on l'affiche direct à l'écran
            if (salonActuel === messageRecu.Salon_id) {
                messageRecu.profils = { pseudo: pseudo };
                afficherMessages(messageRecu);
            } else {
                // Marquer le message comme non lu
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

// Fonction pour créer et injecter visuellement une bulle de message
function afficherMessages(message) {

    const liste = document.querySelector("#historique-messages");

    const div = document.createElement("div");
    div.classList.add("bulle");

    // Applique une classe CSS différente selon si le message a été envoyé par soi-même ou reçu
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

    // Bouton de traduction attaché à chaque message
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

    // Force le défilement automatique de la zone de chat vers le bas (dernier message)
    const defilement = document.querySelector("#messages");
    defilement.scrollTop = defilement.scrollHeight;
}

// Fonction qui formate proprement l'affichage des dates des messages
function formaterDate(date) {
    const dateObj = new Date(date);
    // Formate la date actuelle
    return dateObj.toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Fonction qui met à jour l'aperçu d'un salon dans la liste de gauche et fait remonter le salon en haut de la liste
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
        li.prepend(salon_Concerne); // Remonte le salon actif en haut de la liste
        }
}

MaSession();

// --- BARRE DE RECHERCHE DE SALONS ---
const recherche = document.querySelector("#salon-recherche");

if (recherche) {
    recherche.addEventListener("input", function (event) {
        const salon = event.target.value.toLowerCase();
        const liste_salon = document.querySelectorAll("#liste-conversations li");
        // Filtre la liste des salons en temps réel selon la saisie de l'utilisateur
        liste_salon.forEach(li => {
            const elementPseudo = li.querySelector("strong");
            const pseudo = elementPseudo ? elementPseudo.textContent.toLowerCase() : "";
            if (pseudo.includes(salon)) {
                li.style.display = "";// Affiche le salon si ça correspond
            } else {
                li.style.display = "none";// Masque le salon sinon
            }
        });
    });
}


