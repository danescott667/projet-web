// Paragraphe où on affiche les messages d'erreur à l'utilisateur
const messageErreur = document.querySelector("#message-erreur");

// La variable contient le formulaire lui-même
const formulaire = document.querySelector("form");

// un ecouteur sur le formulaire qui reagit a l'evennement envoyer
formulaire.addEventListener("submit", async function (event) {
    // permet d'eviter le rechargement automatique du navigateur et permet l'execution de notre code
    event.preventDefault();
    messageErreur.textContent = "";


    // la valeur de ce que l'utilisateur a saisi dans les champs
    const mdp = document.querySelector("#mdp").value;
    const email = document.querySelector("#email").value;

    // temporaire pour avoir un affichage dans la console
    console.log(mdp);
    console.log(email);


    // envoies l'email et le mdp à Supabase pour se connecter au compte
    const { data, error } = await client.auth.signInWithPassword({ email: email, password: mdp });

    // temporaire pour les tests
    console.log(data, error);


    // renvoie une erreur si supbase refuse la requete
    if (error) {
        messageErreur.textContent = error.message;
        return;
    }


    // redirection vers la page conversation
    window.location.href = "conversation.html";
});
