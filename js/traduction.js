// fonction qui traduit u// traduit un texte vers la langue choisie ; la langue d'origine est détectée automatiquement par l'APIn texte français vers la langue choisie renvoie le texte tel quel si la langue est le français car par défaut francais
async function traduire(texte, langueCible) {

    // construit l'adresse de l'API : texte encodé + détection automatique -> langue choisie
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texte) + "&langpair=Autodetect|" + langueCible;

    // appelle l'API MyMemory
    const reponse = await fetch(url);
    // lit sa réponse JSON 
    const donnees = await reponse.json();

    // l'API a refusé ou n'a rien pu traduire : on garde le message d'origine
    if (Number(donnees.responseStatus) !== 200) {
        return texte;
    }

    // le message est déjà dans la langue du lecteur : rien à traduire
    if (donnees.responseData.detectedLanguage === langueCible) {
        return texte;
    }

    // renvoie le texte traduit
    return donnees.responseData.translatedText;


}

