// /src/js/form-handler.js

export function initFormHandler() {
    const form = document.querySelector('.login-form');
    const Email = document.getElementById('email');
    const Password = document.getElementById('password');
    const Verification = document.getElementById('verification');
    const Errordisplay = document.querySelector('.msgError');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        Errordisplay.textContent = "";

        if (Password.value !== Verification.value) {
            Errordisplay.textContent = "Mot de passe non conforme";
            // Petit effet visuel : le formulaire tremble si erreur
            form.classList.add('shake-animation');
            setTimeout(() => form.classList.remove('shake-animation'), 500);
            return;
        }

        const donneesFormulaire = { 
            email: Email.value,
            password: Password.value,
        };

        try {
            // Note : Changement de l'URL cible pour correspondre au fichier connect-page.html
            const reponse = await fetch('http://localhost:3000/inscription', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(donneesFormulaire)
            });
        
            const result = await reponse.json();
            if (reponse.ok) {
                // Redirection vers la nouvelle page de connexion harmonisée
                window.location.href = "../connection-page/connect-page.html";
                form.reset();
            } else {
                Errordisplay.textContent = "Erreur : " + result.message;
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
            Errordisplay.textContent = "Impossible de joindre le serveur pour le moment.";
        }
    });
}
