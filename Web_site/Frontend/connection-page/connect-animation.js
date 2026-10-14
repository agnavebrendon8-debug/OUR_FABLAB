// /src/js/sphere-animation.js




import * as THREE from 'three'; 

export function initConnectAnimation(){
    const canvas = document.querySelector(".Rendering_canvas");
    if(!canvas) {
        console.log("Votre canvas ne s'est pas cree correctement ");
        return ;
    }
    const moveMouse = new THREE.Vector2(-100, 100);
    const prevmoveMouse = new THREE.Vector2(-100, 100);
    let mouseVelocity = 0;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Définition de la grille de particules 
    const countX = 60 ;
    const countY = 60; 
    const spacing = 0.25 ;
    const numParticules = countX * countY ;

    const positions = new Float32Array(numParticules * 3 );
    const colors = new Float32Array(numParticules * 3);

    let index = 0 ;
    for(let x = 0; x < countX; x++){
        for(let y = 0; y < countY; y++){
            // Centrage de la grille 
            positions[index] = (x * spacing) - ((countX * spacing)/ 2);  // X
            positions[index + 1] = 0 ;
            positions[index + 2] = (y * spacing) - ((countY * spacing) / 2) ; // Z
            
            // Dégradé de couleur bleu/cyan technologique de base
            colors[index] = 7 / 255 ; 
            colors[index + 1]= 91 / 255 ;
            colors[index + 2]= 140 / 255 ;
        
            index += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    function CreateCircleTexture(){
        const c = document.createElement('canvas');
        c.width = 32; 
        c.height = 32 ;
        const ctx = c.getContext('2d');
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI*2);
        ctx.fillStyle = '#062d43';
        ctx.fill();
        return new THREE.CanvasTexture(c);
    }

    const material = new THREE.PointsMaterial({
        size:0.08, vertexColors:true, map: CreateCircleTexture(), transparent: true, alphaTest:0.5
    });

    const waveGrid = new THREE.Points(geometry, material);
    
    // CORRECTION CRITIQUE : Ajout de la grille de vagues à la scène pour qu'elle s'affiche !
    scene.add(waveGrid);

    let count = 0;
    
    function animate(){
        requestAnimationFrame(animate);

        const positionAttribute = geometry.attributes.position;
        const colorAttribute = geometry.attributes.color;
        const posArray = positionAttribute.array;
        const colArray = colorAttribute.array;

        count += 0.03 ;
        let ptr = 0 ;

        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                // Calcul de la vague naturelle automatique
                const waveX = Math.sin((x * 0.2) + count);
                const waveY = Math.cos((y * 0.2) + count);
                let currentY = (waveX + waveY) * 0.25;

                // Réaction interactive : Si la souris bouge, on amplifie la vague locale
                const pX = posArray[ptr];
                const pZ = posArray[ptr + 2];
                
                // Distance 2D sur le plan entre la souris normalisée et la particule
                const distToMouse = Math.sqrt(Math.pow(pX - (moveMouse.x * 5), 2) + Math.pow(pZ - (-moveMouse.y * 5), 2));

                if (distToMouse < 2.0 && mouseVelocity > 0) {
                    const factor = (1.0 - (distToMouse / 2.0)) * mouseVelocity * 3.0;
                    currentY += Math.sin(count * 5) * factor;

                    // Les particules stimulées s'allument à l'orange emblématique de FireBlize !
                    colArray[ptr] = 232 / 255;
                    colArray[ptr + 1] = 168 / 255;
                    colArray[ptr + 2] = 5 / 255;
                } else {
                    // Retour progressif aux teintes bleues d'origine
                    colArray[ptr] = 7 / 255;
                    colArray[ptr + 1] = 91 / 255;
                    colArray[ptr + 2] = 140 / 255;
                }

                posArray[ptr + 1] = currentY; // Application de la hauteur calculée
                ptr += 3;
            }
        }

        positionAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;

        // Légère rotation d'ensemble pour donner de la vie au tissu
        waveGrid.rotation.y = count * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // Gestion adaptative du redimensionnement de l'écran
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Écouteur et calcul des mouvements et de la vélocité de la souris
    window.addEventListener('mousemove', (event) => {
        prevmoveMouse.copy(moveMouse);

        moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        mouseVelocity = moveMouse.distanceTo(prevmoveMouse);
    });
}





