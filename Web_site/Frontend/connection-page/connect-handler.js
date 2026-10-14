// /src/js/connect-handler.js

export function initConnectHandler() {
    const form = document.querySelector('form');
    // On cible les inputs par leur type text/password puisque ton HTML d'origine n'avait pas d'ID
    const UsernameInput = document.querySelector('input[type="text"]');
    const PasswordInput = document.querySelector('input[type="password"]');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const donneesConnexion = {
            username: UsernameInput.value.trim(),
            password: PasswordInput.value
        };

        try {
            const reponse = await fetch('http://localhost:3000/connexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donneesConnexion)
            });

            const result = await reponse.json();

            if (reponse.ok) {
                // Connexion réussie : Redirection vers le tableau de bord ou l'accueil
                window.location.href = "/login_page/Accueil-page/index-accueil.html";
                form.reset();
            } else {
                alert("Erreur : " + result.message);
            }
        } catch (error) {
            console.error("Erreur réseau lors de la connexion :", error);
            alert("Impossible de joindre le serveur d'authentification.");
        }
    });
}
