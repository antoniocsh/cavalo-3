import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createLobby } from './generators/createLobby.js';
import { startRace } from './game_logic/horseRace.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';



function generateFloor() {
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    // const placeholder = textureLoader.load("../textures/placeholder.png");
    const placeholder = textureLoader.load("../textures/grass.png");


    const WIDTH = 200
    const LENGTH = 200

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial(
        {
            map: placeholder
        })
    wrapAndRepeatTexture(material.map)
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2

    return floor
}


function wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 50
}


// function createTower() {
//     const tower = new THREE.Group();
//     for (let i = 0.5; i < 25; i++) {
//         const color = new THREE.Color(Math.random(), Math.random(), Math.random());
//         const material = new THREE.MeshBasicMaterial({ color });
//         const geometry = new THREE.BoxGeometry(1, 1, 1);
//         const block = new THREE.Mesh(geometry, material);
//         block.position.y = i;
//         tower.add(block);
//     }
//     return tower;
// }

async function init() {
    const FENCE_WIDTH = 15;
    const FENCE_LENGTH = 15;
    const scene = new THREE.Scene();



    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



    const geometry = new THREE.BoxGeometry(400, 400, 400);

    // Carregando as texturas
    const Textureloader = new THREE.TextureLoader();
    const textures = {
        'top': Textureloader.load('../textures/sky_pieces/Top.bmp'),
        'right': Textureloader.load('../textures/sky_pieces/Right.bmp'),
        'back': Textureloader.load('../textures/sky_pieces/Back.bmp'),
        'left': Textureloader.load('../textures/sky_pieces/Left.bmp'),
        'front': Textureloader.load('../textures/sky_pieces/Front.bmp'),
        'bottom': Textureloader.load('../textures/sky_pieces/Bottom.bmp')
    };

    // Aplica as texturas a cada face do cubo
    const materials = [
        new THREE.MeshBasicMaterial({ map: textures.right, side: THREE.BackSide, depthTest: false  }), // Front face
        new THREE.MeshBasicMaterial({ map: textures.left, side: THREE.BackSide, depthTest: false  }),  // Back face
        new THREE.MeshBasicMaterial({ map: textures.top, side: THREE.BackSide, depthTest: false  }),  // Top face
        new THREE.MeshBasicMaterial({ map: textures.bottom, side: THREE.BackSide, depthTest: false  }), // Bottom face
        new THREE.MeshBasicMaterial({ map: textures.front, side: THREE.BackSide, depthTest: false  }),  // Left face
        new THREE.MeshBasicMaterial({ map: textures.back, side: THREE.BackSide, depthTest: false  })  // Right face
    ];

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    const lobby = await createLobby(FENCE_WIDTH, FENCE_LENGTH);
    scene.add(lobby);



    // const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    // const planeHelper = new THREE.PlaneHelper(plane, 200, 0x00ff00);
    // scene.add(planeHelper);

    scene.add(generateFloor());
    

    // const light = new THREE.DirectionalLight(0xffffff, 6);
    // light.position.set(10, 10, 10);
    // scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5); // Luz ambiente suave
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direcional suave
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);


    const axes = new THREE.AxesHelper(15);
    scene.add(axes);

    let myHorse;
    let isMyHorseBusy = false;
    let myHorseAngle = 0;
    let myHorseCircle = 0;
    const myHorseSpeed = 0.01;
    // let myHorseAccel = 1;

    let myHorseCamera;

    const loader = new GLTFLoader();
    loader.load('/models/horse.glb', (gltf) => {
        myHorse = new THREE.Object3D(); // Wrapper
        const horseModel = gltf.scene;
        horseModel.scale.set(0.1, 0.1, 0.1);
        horseModel.position.set(0, 0, 0);

        // Attach model to the wrapper
        myHorse.add(horseModel);

        // Create and attach a perspective camera
        myHorseCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 400);
        myHorseCamera.position.set(0, 6, 0); // Adjust to be slightly above & behind the horse
        myHorseCamera.lookAt(horseModel.position.clone().add(new THREE.Vector3(0, 5, 5))); // Face forward

        myHorse.add(myHorseCamera);
        scene.add(myHorse);
    });


    let bot1;

    loader.load('/models/horse.glb', (gltf) => {
        bot1 = gltf.scene;
        bot1.scale.set(0.1, 0.1, 0.1);
        bot1.position.set(0, -20, 0);
        scene.add(bot1);
    });

    let bot2;

    loader.load('/models/horse.glb', (gltf) => {
        bot2 = gltf.scene;
        bot2.scale.set(0.1, 0.1, 0.1);
        bot2.position.set(0, -20, 0);
        scene.add(bot2);
    });

    let bot3;

    loader.load('/models/horse.glb', (gltf) => {
        bot3 = gltf.scene;
        bot3.scale.set(0.1, 0.1, 0.1);
        bot3.position.set(0, -20, 0);
        scene.add(bot3);
    });


    // const tower = createTower();
    // tower.position.set(5, 0, 5);
    // scene.add(tower);

    // Câmera em primeira pessoa
    const FPCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 400);
    FPCamera.position.set(0, 4, 15);

    // Câmera de cena com OrbitControls
    const SceneCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 400);
    SceneCamera.position.set(10, 10, 20);
    const orbitControls = new OrbitControls(SceneCamera, document.body);
    orbitControls.enableDamping = true;

    let activeCamera = FPCamera;



    let yaw = 0;
    let keys = {};
    const speed = 0.2;

    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    document.addEventListener('click', () => {
        if (activeCamera === FPCamera) {
            document.body.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body && activeCamera === FPCamera) {
            const sensitivity = 0.002;
            yaw -= event.movementX * sensitivity;
            FPCamera.rotation.set(0, yaw, 0);
        }
    });

    function updateCameraMovement() {
        if (activeCamera !== FPCamera) return;
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();

        FPCamera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        right.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();

        let moveDirection = new THREE.Vector3();
        if (keys['w']) moveDirection.add(direction);
        if (keys['s']) moveDirection.addScaledVector(direction, -1);
        if (keys['a']) moveDirection.add(right);
        if (keys['d']) moveDirection.addScaledVector(right, -1);

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            FPCamera.position.addScaledVector(moveDirection, speed);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        updateCameraMovement();
        orbitControls.update();

        if (myHorse && !isMyHorseBusy) {
            const radius = Math.min(FENCE_WIDTH, FENCE_LENGTH) * 1.5;
            myHorseAngle += myHorseSpeed;
            myHorse.position.x = Math.cos(myHorseAngle) * radius;
            myHorse.position.z = Math.sin(myHorseAngle) * radius;
            myHorse.rotation.y = -myHorseAngle;
            myHorseCircle += myHorseAngle;
            if (myHorseCircle >= 2 * Math.PI) { myHorseCircle -= 2 * Math.PI };
        }


        renderer.render(scene, activeCamera);
    }

    // Botão para alternar câmeras e estado do ponteiro
    const toggleCamButton = document.createElement('toggleCamButton');
    toggleCamButton.textContent = 'Alternar Câmera';
    toggleCamButton.style.position = 'absolute';
    toggleCamButton.style.top = '10px';
    toggleCamButton.style.left = '10px';
    toggleCamButton.style.padding = '10px';
    toggleCamButton.style.background = 'black';
    toggleCamButton.style.color = 'white';
    toggleCamButton.style.border = 'none';
    toggleCamButton.style.cursor = 'pointer';
    toggleCamButton.onclick = () => {
        activeCamera = activeCamera === FPCamera ? SceneCamera : FPCamera;

        if (activeCamera === FPCamera) {
            document.body.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    };
    document.body.appendChild(toggleCamButton);


    // const morespeedButton = document.createElement('morespeedButton');
    // morespeedButton.textContent = 'MAIS RAPIDO';
    // morespeedButton.style.position = 'absolute';
    // morespeedButton.style.top = '10px';
    // morespeedButton.style.right = '10px';
    // morespeedButton.style.padding = '10px';
    // morespeedButton.style.background = 'black';
    // morespeedButton.style.color = 'white';
    // morespeedButton.style.border = 'none';
    // morespeedButton.style.cursor = 'pointer';
    // morespeedButton.onclick = () => {
    //     myHorseAccel += 1;
    // };
    // document.body.appendChild(morespeedButton);

    const startRaceButton = document.createElement('startRaceButton');
    startRaceButton.textContent = 'Começar Corrida';
    startRaceButton.style.position = 'absolute';
    startRaceButton.style.top = '50px';
    startRaceButton.style.left = '10px';
    startRaceButton.style.padding = '10px';
    startRaceButton.style.background = 'red';
    startRaceButton.style.color = 'white';
    startRaceButton.style.border = 'none';
    startRaceButton.style.cursor = 'pointer';
    startRaceButton.onclick = () => {
        myHorse.rotation.y = 0;

        myHorseCircle = 0;

        isMyHorseBusy = true;
        activeCamera = myHorseCamera; // Switch to horse camera
        document.exitPointerLock(); // Exit pointer lock mode

        startRace(myHorse, bot1, bot2, bot3);
    };

    document.body.appendChild(startRaceButton);

    animate();
}



window.onload = init;
