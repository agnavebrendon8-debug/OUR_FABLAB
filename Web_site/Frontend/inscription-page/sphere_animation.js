// /src/js/sphere-animation.js
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/MaterialXNoise.js';
import { alphaT } from 'three/src/nodes/TSL.js';
import { float } from 'three/tsl';


export function initSphereAnimation() {
    const canvas = document.querySelector('.Rendering_canvas');
    if (!canvas) return;


    // --- IDÉE D'AMÉLIORATION INTÉGRÉE ---
    // Assure-toi que ton WebGLRenderer possède l'option alpha: true
    // Exemple : const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    // renderer.setClearColor(0x000000, 0); // Fond du canvas 100% transparent pour le CSS clair

    

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = 0.5

const moveMouse = new THREE.Vector2(-100, 100);
const prevmoveMouse = new THREE.Vector2(-100, 100);
let mouseVelocity = 0;


//DEfinition et Finition des points 
function CreateCircleTexture(size, radius){
    // Creer un element directement en memoire sans avoir a l afficher sur la page 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    // ON vide la liste des chemind ctuels 
    const ctx = canvas.getContext('2d') ;
    const center = size/2 ;

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'
    ctx.fill();

    return new THREE.CanvasTexture(canvas);

} 

// Moyen pou charger des textures 
// const circletexture = new THREE.TextureLoader().load();
// on creer notre propre texture 
const myCircleTexture = CreateCircleTexture(32, 14);

const scene = new THREE.Scene();

const container = document.querySelector('.Rendering_canvas')
const width = container.clientWidth;
const height = container.clientHeight;


// const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 1000);
const camera = new THREE.PerspectiveCamera(75, width/height, 0.01, 1000);
camera.position.set(0 , 0.5, 8);
scene.add(camera);

const radius = 5 ;
const nbPointsTheta = 100;
const nbPointsPhi = 100;


const Points = [];
const originalpos = []

for(let i = 0; i <= nbPointsTheta; i++ ){
    const theta = (i / nbPointsTheta) * Math.PI ; 
    
    for(let j = 0; j <= nbPointsPhi*(1 - Math.abs(0.5 * Math.cos(theta))); j++){
        const phi = j/ (nbPointsPhi * (1 - Math.abs(0.5 * Math.cos(theta)))) * Math.PI * 2 ; 

        const x = radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(theta);

        Points.push(x, y, z);
        originalpos.push(x, y, z);
    }
}

 ;
const pointsT = Points.length /3 ;

const geometry = new THREE.BufferGeometry();
const initColors = []

for(let i = 0; i < pointsT; i++ ){
    initColors.push(7 * Math.random(), 91 * Math.random(), 140 * Math.random());
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(Points, 3)); // 3 par 3 
geometry.setAttribute('color', new THREE.Float32BufferAttribute(initColors, 3));

const pointMaterial = new THREE.PointsMaterial({ vertexColors: true , map: myCircleTexture , size: 0.15, alphaTest:0.5 , transparent : true}); // sizeAttenuation gerr l effet de agrandi et retrecit pour les points 

const Sphergroup = new THREE.Group();
scene.add(Sphergroup);

const pointsObject = new THREE.Points(geometry, pointMaterial);
Sphergroup.add(pointsObject);

// scene.add(pointsObject); // const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());


const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('.Rendering_canvas'), antialias:true, alpha:true }); // Antialias pour lisser les pixels 
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio , 2));   // on definit ensuit un ixel ration pour que le rendu s'adapte parfaitement a l'ecran
renderer.setClearColor(0x000000, 0);

// une chose cool camera.lookAt(position);

const controls = new OrbitControls(camera, renderer.domElement);

controls.minDistance = 1.5;
controls.maxDistance = 12;



const pointsVelocity = new Float32Array(pointsT);
const pointsDis = new Float32Array(pointsT);

const clock = new THREE.Timer();
if(clock.start) clock.start();

const virtualSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), radius); 
const mouse3D = new THREE.Vector3(); // Stockera la position 3D exacte sur la surface de la sphère
const pointWorldPos = new THREE.Vector3();
let plus = 0; 
// 2. LA NOUVELLE FONCTION UPDATESPHERE ADAPTATIVE
function updateSphere(){
    clock.update();
    const delta = Math.min(clock.getDelta(), 0.1);
    if (delta === 0) return;

    // const elapsed = clock.getElapsed();

    Sphergroup.updateMatrixWorld();

    const currentePos = geometry.attributes.position.array ;
    const Colorpoint = geometry.attributes.color.array ;
    
    // PROJECTION PARFAITE : On cherche où le rayon de la souris percute la sphère de rayon R
    raycaster.setFromCamera(moveMouse, camera);    
    const hasIntersection = raycaster.ray.intersectSphere(virtualSphere, mouse3D);


    // ADAPTATION AU RAYON : La zone d'influence fait maintenant 15% de la taille de la sphère
    // (Si radius = 1 -> action sur 0.15 | Si radius = 20 -> action sur 3.0 unités)
    const rayonInfluence = radius * 0.15; 
    
    // Intensité ajustée proportionnellement à la taille pour garder la même nervosité
    const forceImpulsion = 45 * radius; 
    const k = 120; 
    const c = 8;

    for(let i = 0; i < pointsT; i++){
        const i3 = i * 3;
 
        pointWorldPos.set(currentePos[i3], currentePos[i3 + 1], currentePos[i3 + 2]);
        pointWorldPos.applyMatrix4(Sphergroup.matrixWorld);


        const origX = originalpos[i3];
        const origY = originalpos[i3 + 1];
        const origZ = originalpos[i3 + 2];
        
        // On n'applique la force de distance que si la souris touche effectivement la sphère
        if (hasIntersection && mouseVelocity > 0) {
            const distanceALaSouris = pointWorldPos.distanceTo(mouse3D);


            if (distanceALaSouris < rayonInfluence) {
                // Courbe d'atténuation fluide selon la distance
                const intensiteProximite = 1.0 - (distanceALaSouris / rayonInfluence);
                
                // Impulsion
                pointsVelocity[i] += mouseVelocity * forceImpulsion * intensiteProximite;
                
                Colorpoint[i3] = 232/255 ; 
                Colorpoint[i3 + 1] = 168 / 255 ; 
                Colorpoint[i3 + 2] = 5 / 255 ; 

            }
            else {

                Colorpoint[i3] = initColors[i3]/255  ; 
                Colorpoint[i3 + 1] =  initColors[i3 + 1] / 255 ; 
                Colorpoint[i3 + 2] = initColors[i3 + 2] / 255; 
            }
        }
        else {
            Colorpoint[i3] = initColors[i3]/255  ; 
            Colorpoint[i3 + 1] =  initColors[i3 + 1] / 255 ; 
            Colorpoint[i3 + 2] = initColors[i3 + 2] / 255; 
        }
        


        // Équation de mouvement amortie (Ressort)
        const forceRessort = (-k * pointsDis[i]) - (c * pointsVelocity[i]); 
        pointsVelocity[i] += forceRessort * delta;
        pointsDis[i]      += pointsVelocity[i]* delta ;

        // Mise à jour des coordonnées le long du rayon 3D
        const distOrig = Math.sqrt(origX*origX + origY*origY + origZ*origZ);
        const Xdir = distOrig > 0 ? origX / distOrig : 0;
        const Ydir = distOrig > 0 ? origY / distOrig : 0;
        const Zdir = distOrig > 0 ? origZ / distOrig : 0;

        currentePos[i3]     = origX + Xdir * pointsDis[i];
        currentePos[i3 + 1] = origY + Ydir * pointsDis[i];
        currentePos[i3 + 2] = origZ + Zdir * pointsDis[i];
    }

    // Un seul envoi global de la géométrie mise à jour vers le GPU
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true ;

    // Amortissement de la vélocité globale de la souris
    mouseVelocity *= 0.88;
    if(mouseVelocity < 0.008) mouseVelocity = 0.01;
    console.log("Mouse velocity" + mouseVelocity);
}


    function Animation() {
        requestAnimationFrame(Animation);

        const Elapsed = clock.getElapsed();
        const BoostSpeed =  Math.abs(Math.sin(Elapsed * 0.5)) * 0.008 ; 

        if (typeof updateSphere === 'function') updateSphere();
        if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
            renderer.render(scene, camera);
        }
        
        if (typeof Sphergroup !== 'undefined') {
            // Sphergroup.rotation.x += 0.002 + BoostSpeed ;
            Sphergroup.rotation.y += 0.002 + ( BoostSpeed ) ;
        }


        if (typeof controls !== 'undefined') controls.update();
    }

    Animation();

    // Écoute du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (typeof camera !== 'undefined' && typeof renderer !== 'undefined') {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });

    // Mouvements de la souris normalisés
    window.addEventListener('mousemove', (event) => {
        if (typeof prevmoveMouse !== 'undefined' && typeof moveMouse !== 'undefined') {
            prevmoveMouse.copy(moveMouse);

            moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            if (typeof mouseVelocity !== 'undefined') {
                mouseVelocity = moveMouse.distanceTo(prevmoveMouse);
            }
        }
    });
}
