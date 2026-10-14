// /src/js/script_sec.js

import { initSphereAnimation } from './sphere_animation.js';
import { initFormHandler } from './form-handler.js';

// On attend que le DOM (HTML) soit totalement chargé pour lancer les scripts
document.addEventListener('DOMContentLoaded', () => {
    // Lance la boucle d'animation Three.js de ta sphère
    initSphereAnimation();
    
    // Active les écouteurs d'événements du formulaire d'inscription
    initFormHandler();
});
