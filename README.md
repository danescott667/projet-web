# Tchat' — Messagerie instantanée Web

Projet fil-rouge du cours **8WEB101 – Conception et programmation de sites Web** (UQAC, automne 2026).

Tchat' est une messagerie instantanée Web. Elle permet de s'inscrire, d'ajouter des contacts et de discuter en temps réel dans des salons. Chaque message peut être traduit dans la langue choisie par la personne utilisatrice.

**Site en ligne : https://danescott667.github.io/projet-web/**

## Équipe

| Membre | GitHub | Partie principale |
|---|---|---|
| Dane Wangni Ngatchouo | [danescott667](https://github.com/danescott667) | Comptes (inscription, connexion, sessions), contacts, paramètres, fonction de traduction, CSS de base et version mobile |
| Avinash Passoubady | [Indien06](https://github.com/Indien06) | Salons et messages (envoi, affichage, temps réel, horodatage), aperçu des messages, notifications, bouton « Traduire » |

## Fonctionnalités

### Principales
- **Inscription et connexion** avec une adresse courriel et un mot de passe (Supabase Auth). Les pages connectées sont protégées : sans session, on revient à la page de connexion.
- **Liste de contacts** : chaque personne voit ses propres contacts, peut en ajouter un avec son pseudo et en supprimer un.
- **Liste des salons de conversation**, avec une recherche par nom.
- **Envoi et réception de messages en temps réel** dans un salon (Supabase Realtime).
- **Affichage horodaté** des messages.

### Secondaires
- **Notification visuelle** : un salon qui reçoit un nouveau message est marqué « non lu ».
- **Aperçu du dernier message** sous chaque salon.

### Fonctionnalité supplémentaire : la traduction
- Un bouton **« Traduire »** sous chaque message.
- La langue est choisie sur la page **Paramètres** (FR, EN, ES, DE, CN) et enregistrée dans le profil.
- La **langue d'origine du message est détectée automatiquement** : un message écrit en anglais, en espagnol ou en français est traduit correctement.
- La traduction passe par l'API gratuite **MyMemory** (`traduction.js`). Si le message est déjà dans la langue choisie, ou si l'API ne répond pas, le message d'origine reste affiché.

## Technologies

| Rôle | Choix |
|---|---|
| Interface | HTML, CSS, JavaScript |
| Comptes, base de données et temps réel | [Supabase](https://supabase.com) (PostgreSQL), bibliothèque `supabase-js` |
| Traduction | API [MyMemory](https://mymemory.translated.net) |
| Hébergement | GitHub Pages |

Il n'y a pas de serveur à nous : le navigateur communique directement avec Supabase.

## Structure du projet

```
projet-web/
├── index.html          Connexion
├── inscription.html    Inscription
├── conversation.html   Salons et messages
├── contact.html        Mes contacts et ajout d'un contact
├── parametres.html     Choix de la langue de traduction
├── css/
│   └── style.css       Styles communs et version mobile (media query à la fin)
├── images/
│   └── tchatlogo.png   Logo
└── js/
    ├── supabase.js     Création du client Supabase (partagé par toutes les pages)
    ├── sessions.js     Fonctions partagées : vérifier la session, déconnexion, redirection
    ├── connexion.js    Formulaire de connexion
    ├── inscription.js  Formulaire d'inscription et création du profil
    ├── contacts.js     Affichage, ajout et suppression des contacts
    ├── messages.js     Salons, messages, temps réel, aperçu, notifications
    ├── parametres.js   Lecture et enregistrement de la langue
    └── traduction.js   Fonction traduire() (API MyMemory, détection automatique de la langue)
```

Ordre de chargement des scripts : `supabase-js` (CDN) → `supabase.js` → `sessions.js` → script de la page.

## Base de données (Supabase)

| Table | Colonnes principales | Rôle |
|---|---|---|
| `profils` | `id` (= id du compte), `pseudo`, `langue` | Informations de chaque personne |
| `contacts` | `proprietaire_id`, `contact_id` → `profils.id` | Qui a ajouté qui (un même contact une seule fois) |
| `salons` | `id`, `nom` | Les salons de conversation |
| `messagerie` | `expediteur_id`, `Salon_id`, `contenu`, `created_at` | Les messages |

### Sécurité
- La clé présente dans `supabase.js` est la clé **publique (anon)**. Elle peut être visible dans le code du navigateur.
- La protection repose sur la **sécurité au niveau des lignes (RLS)** de Supabase. Par exemple, chaque personne ne voit que **ses** contacts.
- Chaque personne ne peut supprimer que ses propres contacts (règle RLS de suppression).
- Les messages et les pseudos sont affichés avec `textContent` (et non `innerHTML`) pour éviter l'injection de code (XSS).

## Utilisation

1. Ouvrir le site : https://danescott667.github.io/projet-web/
2. Créer un compte (pseudo, courriel, mot de passe), ou se connecter.
3. **Conversations** : choisir un salon, puis écrire un message. Il apparaît en temps réel chez les autres personnes.
4. **Contact** : ajouter une personne avec son pseudo, ou la retirer avec « Supprimer ».
5. **Paramètres** : choisir la langue, puis utiliser le bouton « Traduire » sous un message.

## Tester en local

Ouvrir le dossier dans VSCodium (ou VS Code) et lancer `index.html` avec l'extension **Live Preview** / **Live Server**.

## Pistes d'amélioration
- Statut « en train d'écrire… » et indicateur « en ligne / hors ligne » (Supabase Realtime)
- Statuts des messages : envoyé, reçu, lu
- Partage d'images (Supabase Storage)
- Système d'invitations pour les contacts : accepter ou refuser une demande
- Ouvrir une discussion privée en cliquant sur un contact
