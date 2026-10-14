// /src/js/connect_main.js
//Fichier qui gerer tous les script en import 

import { initConnectAnimation } from './connect-animation.js';
import { initConnectHandler } from './connect-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialise le tissu de vagues en particules 3D à l'arrière-plan
    initConnectAnimation();

    // Active l'écouteur d'événements du formulaire de Login
    initConnectHandler();
});
