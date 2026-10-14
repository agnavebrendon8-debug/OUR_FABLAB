gsap.registerPlugin(SplitText);

document.fonts.ready.then(() => {

  const text = document.querySelector(".hero-label");

  gsap.set(text, { opacity: 1 });

  const mySplitText = SplitText.create(text, {
    type: "chars, words",
    charsClass: "char"
  });

  const chars = mySplitText.chars;

  gsap.from(chars, {
    duration: 2,
    opacity: 0,
    scale: 0,
    y: 80,
    rotationX: 180,
    transformOrigin: "0% 50% -50px",
    ease: "back.out(1.7)",
    stagger: 0.05,

    onComplete: () => {
      mySplitText.revert();
      text.removeAttribute("aria-hidden");
    }
  });

});


// On déclare les variables pour stocker l'instance du split et de l'animation
let split, animation;

function setup() {
  // On nettoie proprement les instances existantes en cas de redimensionnement
  if (split) split.revert();
  if (animation) animation.revert();

  // On cible uniquement le titre .hero h1 et on ne découpe qu'en caractères (chars)
  split = SplitText.create(".hero h1", { type: "chars" });

  // L'animation se déclenche immédiatement après le split
  animation = gsap.from(split.chars, {
    x: 150,
    opacity: 0,
    delay :2.5,
    duration: 3,
    ease: "power4.out", // "power4.out" est plus fluide pour une transition d'apparition
    stagger: 0.04
  });
}

// On lance la configuration initiale au chargement de la page
setup();

// On relance la configuration si la fenêtre est redimensionnée pour recalculer la position des lettres
window.addEventListener("resize", setup);

// Assurez-vous d'avoir chargé GSAP avant ce script : 
// <script src="https://cloudflare.com"></script>
const zone = document.querySelector('.mag-zone');
const btn = zone.querySelector('.mag-btn');

zone.addEventListener('mousemove', (e) => {
  const rect = zone.getBoundingClientRect();
  
  // Calcul de la position magnétique
  const relX = e.clientX - rect.left - (rect.width / 2);
  const relY = e.clientY - rect.top - (rect.height / 2) + 2;

  const targetX = relX * 0.45;
  // On applique l'effet magnétique Y et on ajoute un décalage constant de -4px pour l'élévation au survol
  const targetY = (relY * 0.45) - 4; 

  gsap.to(btn, {
    x: targetX,
    y: targetY,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)", // Votre ombre CSS gérée par GSAP
    duration: 0.3,
    ease: "power2.out",
    overwrite: "auto"
  });
});

zone.addEventListener('mouseleave', () => {
  // Retour élastique parfait au centre parfait (0,0) sans élévation ni ombre
  gsap.to(btn, {
    x: 0,
    y: 0,
    boxShadow: "0 0px 0px rgba(0, 0, 0, 0)", // L'ombre disparaît proprement
    duration: 0.6,
    ease: "elastic.out(1, 0.5)",
    overwrite: "auto"
  });
});
