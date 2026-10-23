// fonction qui taduit un texte français vers la langue choisie renvoie le texte tel quel si la langue est le français car par défaut francais
async function traduire(texte, langueCible) {

    if (langueCible === "fr") {

        return texte;
    }

    // construction l’adresse de l’API avec le texte encodé et la paire de langues fr -> langue choisie
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texte) + "&langpair=fr|" + langueCible;

    // appelle l'API MyMemory
    const reponse = await fetch(url);
    // lit sa réponse JSON 
    const donnees = await reponse.json();
    // tempooraire pour tester
    console.log(donnees);
    // renvoie le texte traduit
    return donnees.responseData.translatedText;


}

