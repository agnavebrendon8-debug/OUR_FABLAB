const formulaire = document.getElementById("formulaire");

formulaire.addEventListener("submit", async function (event) {

    // Empêche le rechargement de la page
    event.preventDefault();

    // =====================================================
    // RÉCUPÉRATION DES DONNÉES
    // =====================================================

    const nom = document.getElementById("nom").value.trim();

    const email = document.getElementById("email").value.trim();

    const mot_de_passe_1 =
        document.getElementById("mot_de_passe-1").value;

    const mot_de_passe_2 =
        document.getElementById("mot_de_passe-2").value;

    const message = document.getElementById("message");


    // =====================================================
    // VÉRIFICATION DES CHAMPS
    // =====================================================

    if (!nom || !email || !mot_de_passe_1 || !mot_de_passe_2) {

        message.textContent =
            "Tous les champs sont obligatoires.";

        return;
    }


    // =====================================================
    // VÉRIFICATION DES MOTS DE PASSE
    // =====================================================

    if (mot_de_passe_1 !== mot_de_passe_2) {

        message.textContent =
            "Les mots de passe ne correspondent pas.";

        return;
    }


    // =====================================================
    // DONNÉES À ENVOYER AU SERVEUR
    // =====================================================

    const donnees = {

        nom: nom,

        email: email,

        mot_de_passe_1: mot_de_passe_1,

        mot_de_passe_2: mot_de_passe_2

    };


    console.log("Données récupérées :", {
        nom: nom,
        email: email,
        mot_de_passe_1: "******",
        mot_de_passe_2: "******"
    });


    // =====================================================
    // ENVOI AU SERVEUR
    // =====================================================

    try {

        const reponse = await fetch(
            "/api/utilisateurs",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(donnees)
            }
        );


        // Récupération de la réponse JSON
        const resultat = await reponse.json();


        // =================================================
        // TRAITEMENT DE LA RÉPONSE
        // =================================================

        if (reponse.ok && resultat.success) {

            message.textContent =
                resultat.message;

            formulaire.reset();

        } else {

            message.textContent =
                resultat.message ||
                "Une erreur est survenue.";

        }


    } catch (erreur) {

        console.error(
            "Erreur de connexion au serveur :",
            erreur
        );

        message.textContent =
            "Impossible de contacter le serveur.";

    }

});