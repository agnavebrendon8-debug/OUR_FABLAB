import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

    // ========================================
    // CONFIGURATION
    // ========================================

    const WS_URL = 'ws://localhost:8765';

    // Mets true si ton serveur envoie des angles en radians.
    const INPUT_IS_RADIANS = false;

    // Facultatif : chemin vers le vrai modèle.
    const MODEL_URL = './robot.glb';

    // Noms à adapter aux articulations de ton fichier GLB.
    const GLB_JOINT_NAMES = [
      'joint1', 'joint2', 'joint3',
      'joint4', 'joint5', 'joint6'
    ];

    const AXES = [
      { name: 'Base',     min: -180, max: 180 },
      { name: 'Épaule',   min: -120, max: 120 },
      { name: 'Coude',    min: -150, max: 150 },
      { name: 'Poignet 1',min: -180, max: 180 },
      { name: 'Poignet 2',min: -120, max: 120 },
      { name: 'Poignet 3',min: -180, max: 180 }
    ];

    const angles = [0, 0, 0, 0, 0, 0];
    const targets = [...angles];

    // ========================================
    // SCÈNE
    // ========================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1120');
    scene.fog = new THREE.Fog('#0b1120', 12, 30);

    const camera = new THREE.PerspectiveCamera(
      45, innerWidth / innerHeight, 0.1, 100
    );
    camera.position.set(5, 4.5, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    document.getElementById('scene').appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, 0);
    controls.enableDamping = true;

    scene.add(new THREE.HemisphereLight(0xbdd7ff, 0x20283a, 2));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 8, 5);
    light.castShadow = true;
    scene.add(light);

    const fillLight = new THREE.PointLight(0x38bdf8, 25, 15);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({
        color: '#111827', roughness: 0.85
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(30, 60, '#2563eb', '#273449');
    grid.position.y = 0.01;
    scene.add(grid);

    // ========================================
    // MATÉRIAUX ET PIÈCES DU ROBOT
    // ========================================

    const metal = new THREE.MeshStandardMaterial({
      color: '#94a3b8', metalness: 0.8, roughness: 0.28
    });

    const blue = new THREE.MeshStandardMaterial({
      color: '#0284c7', metalness: 0.65, roughness: 0.25
    });

    const dark = new THREE.MeshStandardMaterial({
      color: '#263449', metalness: 0.7, roughness: 0.35
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: '#38bdf8', metalness: 0.5, roughness: 0.22
    });

    const robot = new THREE.Group();
    scene.add(robot);

    const pivots = [];

    function box(parent, size, material, position) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...size), material
      );
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function cylinder(parent, radius, height, material, position) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 32),
        material
      );
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function joint(parent, position) {
      const pivot = new THREE.Group();
      pivot.position.set(...position);
      parent.add(pivot);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 24, 24),
        jointMaterial
      );
      sphere.castShadow = true;
      pivot.add(sphere);
      return pivot;
    }

    function link(parent, length, radius = 0.13) {
      // Bras allongé suivant l'axe X local.
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(length, radius * 2, radius * 2),
        blue
      );
      mesh.position.x = length / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);

      // Habillage métallique de l'articulation.
      cylinder(parent, radius * 1.15, radius * 1.4, metal,
        [length * 0.15, 0, 0]);

      return mesh;
    }

    function createProceduralRobot() {
      robot.clear();
      pivots.length = 0;

      // Socle fixe
      cylinder(robot, 0.65, 0.22, dark, [0, 0.12, 0]);
      cylinder(robot, 0.42, 0.2, metal, [0, 0.3, 0]);
      cylinder(robot, 0.29, 0.3, blue, [0, 0.52, 0]);

      // Axe 1 : rotation de la base autour de Y
      const base = joint(robot, [0, 0.75, 0]);
      pivots.push(base);

      box(base, [0.48, 0.48, 0.42], metal, [0, 0.28, 0]);

      // Axe 2 : épaule, rotation autour de Z
      const shoulder = joint(base, [0, 0.65, 0]);
      pivots.push(shoulder);

      link(shoulder, 1.35, 0.17);

      // Axe 3 : coude
      const elbow = joint(shoulder, [1.35, 0, 0]);
      pivots.push(elbow);

      link(elbow, 1.05, 0.13);

      // Axe 4 : poignet
      const wrist1 = joint(elbow, [1.05, 0, 0]);
      pivots.push(wrist1);

      link(wrist1, 0.48, 0.10);

      // Axe 5
      const wrist2 = joint(wrist1, [0.48, 0, 0]);
      pivots.push(wrist2);

      link(wrist2, 0.3, 0.085);

      // Axe 6 : outil / pince
      const wrist3 = joint(wrist2, [0.3, 0, 0]);
      pivots.push(wrist3);

      box(wrist3, [0.18, 0.12, 0.16], dark, [0.1, 0, 0]);

      // Deux doigts simples
      box(wrist3, [0.25, 0.045, 0.045], metal, [0.28, 0.07, 0]);
      box(wrist3, [0.25, 0.045, 0.045], metal, [0.28, -0.07, 0]);
    }

    createProceduralRobot();

    // ========================================
    // CHARGEMENT OPTIONNEL DU MODÈLE GLB
    // ========================================

    let glbJoints = [];

    const loader = new GLTFLoader();

    loader.load(
      MODEL_URL,
      (gltf) => {
        // Remplace le robot de démonstration.
        robot.clear();
        glbJoints = [];

        const model = gltf.scene;
        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        robot.add(model);

        // Les noms doivent correspondre à ceux du modèle.
        GLB_JOINT_NAMES.forEach((name) => {
          const node = model.getObjectByName(name);
          glbJoints.push(node || null);
        });

        if (glbJoints.every((node) => node === null)) {
          console.warn(
            'Aucune articulation trouvée. Vérifie GLB_JOINT_NAMES.'
          );
        }

        console.log('Modèle GLB chargé', model);
      },
      undefined,
      (error) => {
        console.info(
          'robot.glb non chargé : utilisation du bras de démonstration.',
          error
        );
      }
    );

    // ========================================
    // INTERFACE DES AXES
    // ========================================

    const sliders = document.getElementById('sliders');
    const sliderInputs = [];
    const valueLabels = [];

    AXES.forEach((axis, i) => {
      const row = document.createElement('div');
      row.className = 'joint';

      const label = document.createElement('label');
      const name = document.createElement('span');
      name.textContent = axis.name;

      const value = document.createElement('span');
      value.textContent = '0°';

      label.append(name, value);

      const input = document.createElement('input');
      input.type = 'range';
      input.min = axis.min;
      input.max = axis.max;
      input.step = 1;
      input.value = 0;

      input.addEventListener('input', () => {
        targets[i] = Number(input.value);
        value.textContent = input.value + '°';
      });

      row.append(label, input);
      sliders.appendChild(row);

      sliderInputs.push(input);
      valueLabels.push(value);
    });

    document.getElementById('reset').onclick = () => {
      targets.fill(0);
      sliderInputs.forEach((input) => input.value = 0);
      valueLabels.forEach((label) => label.textContent = '0°');
    };

    // ========================================
    // WEBSOCKET
    // ========================================

    let socket = null;
    let reconnectTimer = null;
    let manualClose = false;

    const dot = document.getElementById('dot');
    const statusText = document.getElementById('statusText');

    function setStatus(connected, text) {
      dot.style.background = connected ? '#22c55e' : '#ef4444';
      statusText.textContent = text;
    }

    function connectWebSocket() {
      manualClose = false;
      clearTimeout(reconnectTimer);

      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.onopen = null;
        socket.onmessage = null;
        socket.close();
      }

      setStatus(false, 'Connexion à ' + WS_URL);

      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        setStatus(true, 'WebSocket connecté');
        console.log('WebSocket connecté');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let values;

          // Formats acceptés :
          // {"joints":[0,30,40,0,10,0]}
          // {"angles":[0,30,40,0,10,0]}
          // {"base":0,"shoulder":30,"elbow":40,...}
          // {"joint1":0,"joint2":30,...}

          if (Array.isArray(data)) {
            values = data;
          } else if (Array.isArray(data.q)) {
            values = data.q;
          } else if (Array.isArray(data.angles)) {
            values = data.angles;
          } else {
            const keys = [
              'base', 'shoulder', 'elbow',
              'wrist1', 'wrist2', 'wrist3'
            ];

            values = keys.map((key, i) =>
              data[key] ?? data['joint' + (i + 1)]
            );
          }

          values.slice(0, 5).forEach((value, i) => {
            if (value === undefined || value === null) return;

            let angle = Number(value);
            if (!Number.isFinite(angle)) return;

            if (INPUT_IS_RADIANS) {
              angle = THREE.MathUtils.radToDeg(angle);
            }

            targets[i] = angle;
            sliderInputs[i].value = THREE.MathUtils.clamp(
              angle, AXES[i].min, AXES[i].max
            );
            valueLabels[i].textContent = angle.toFixed(1) + '°';
          });
        } catch (error) {
          console.error('Message WebSocket invalide :', error);
        }
      };

      socket.onclose = () => {
        setStatus(false, 'Déconnecté — reconnexion...');
        if (!manualClose) {
          reconnectTimer = setTimeout(connectWebSocket, 2000);
        }
      };

      socket.onerror = (error) => {
        console.error('Erreur WebSocket', error);
      };
    }

    document.getElementById('reconnect').onclick = connectWebSocket;

    connectWebSocket();

    // ========================================
    // ANIMATION
    // ========================================

    function animate() {
      requestAnimationFrame(animate);

      // Interpolation pour des mouvements fluides.
      for (let i = 0; i < 5; i++) {
        angles[i] += (targets[i] - angles[i]) * 0.88;
      }
        
        
      if (glbJoints.length > 0) {
        // À adapter aux axes de rotation réels du modèle GLB.
        glbJoints.forEach((node, i) => {
          if (node) {
            const rad = THREE.MathUtils.degToRad(angles[i]);
            node.rotation.y = rad;
          }
        });
      } else {
        // Bras procédural : axes de démonstration.
        pivots.forEach((pivot, i) => {
          if (!pivot) return;

          const rad = THREE.MathUtils.degToRad(angles[i]);

          if (i === 0) pivot.rotation.y = rad;
          else pivot.rotation.z = rad;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });