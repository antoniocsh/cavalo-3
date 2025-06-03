import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createLobby } from './generators/createLobby.js';
import { startRace } from './game_logic/horseRace.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { createRaceAssets } from './generators/createRaceAssets.js';
import { startPegasusHunt } from './game_logic/pegasusHunt.js';




function generateFloor() {
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    // const placeholder = textureLoader.load("textures/placeholder.png");
    const placeholder = textureLoader.load("textures/grass.png");


    const WIDTH = 700;
    const LENGTH = 700;

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
    map.repeat.x = map.repeat.y = 300
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
    let yaw = 0;
    let pitch = 0;

    let mouseX = 0.5; // Normalizado (0 a 1)
    let mouseY = 0.5; // Normalizado (0 a 1)
    const FENCE_WIDTH = 15;
    const FENCE_LENGTH = 15;
    const SKYBOX = 700;
    const RACEPOSITION_X = 50;
    const RACEPOSITION_Z = -250;

    const scene = new THREE.Scene();



    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);




    const geometry = new THREE.BoxGeometry(SKYBOX, SKYBOX, SKYBOX);

    // Carregando as texturas
    const Textureloader = new THREE.TextureLoader();
    const textures = {
        'top': Textureloader.load('textures/sky_pieces/Top.bmp'),
        'right': Textureloader.load('textures/sky_pieces/Right.bmp'),
        'back': Textureloader.load('textures/sky_pieces/Back.bmp'),
        'left': Textureloader.load('textures/sky_pieces/Left.bmp'),
        'front': Textureloader.load('textures/sky_pieces/Front.bmp'),
        'bottom': Textureloader.load('textures/sky_pieces/Bottom.bmp')
    };

    // Aplica as texturas a cada face do cubo
    const materials = [
        new THREE.MeshBasicMaterial({ map: textures.right, side: THREE.BackSide, depthTest: false }), // Front face
        new THREE.MeshBasicMaterial({ map: textures.left, side: THREE.BackSide, depthTest: false }),  // Back face
        new THREE.MeshBasicMaterial({ map: textures.top, side: THREE.BackSide, depthTest: false }),  // Top face
        new THREE.MeshBasicMaterial({ map: textures.bottom, side: THREE.BackSide, depthTest: false }), // Bottom face
        new THREE.MeshBasicMaterial({ map: textures.front, side: THREE.BackSide, depthTest: false }),  // Left face
        new THREE.MeshBasicMaterial({ map: textures.back, side: THREE.BackSide, depthTest: false })  // Right face
    ];

    const skycube = new THREE.Mesh(geometry, materials);
    scene.add(skycube);

    const lobby = await createLobby(FENCE_WIDTH, FENCE_LENGTH);
    scene.add(lobby);

    const raceAssets = await createRaceAssets(RACEPOSITION_X, RACEPOSITION_Z);

    // const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    // const planeHelper = new THREE.PlaneHelper(plane, 200, 0x00ff00);
    // scene.add(planeHelper);

    scene.add(generateFloor());


    // const light = new THREE.DirectionalLight(0xffffff, 6);
    // light.position.set(10, 10, 10);
    // scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    //make the light cast shadows


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(40, 50, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;

    scene.add(directionalLight);




    // const axes = new THREE.AxesHelper(15);
    // scene.add(axes);

    let myHorse;
    let isMyHorseBusy = false;
    let myHorseAngle = 0;
    let myHorseCircle = 0;
    const myHorseSpeed = 0.01;
    // let myHorseAccel = 1;

    let myHorseCamera;

    const loader = new GLTFLoader();
    loader.load('models/horse.glb', (gltf) => {
        myHorse = new THREE.Object3D(); // Wrapper
        const horseModel = gltf.scene;
        horseModel.scale.set(0.1, 0.1, 0.1);
        horseModel.position.set(0, 0, 0);

        horseModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting
                child.receiveShadow = true; // Enable shadow receiving
                // child.material.color.set(new THREE.Color(0xff00b3));  // Ou: new THREE.Color(0xff00b3)

            }
        });
        // Attach model to the wrapper
        myHorse.add(horseModel);

        // Create and attach a perspective camera
        myHorseCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, SKYBOX);
        myHorseCamera.position.set(0, 6, 0); // Adjust to be slightly above & behind the horse
        myHorseCamera.lookAt(horseModel.position.clone().add(new THREE.Vector3(0, 5, 5))); // Face forward

        myHorse.add(myHorseCamera);
        scene.add(myHorse);
    });

    let pegasusGameInstance = null;

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p' && !pegasusGameInstance) {
            // Desativa o teu controlo de movimento e alterna camera
            activeCamera = SceneCamera; // ou uma camera fixa

            // Começa o jogo dos Pegasuses
            pegasusGameInstance = startPegasusHunt(scene, activeCamera, renderer, (finalPoints) => {
                console.log(`Pegasus Game Ended with points: ${finalPoints}`);
                pegasusGameInstance = null;
                // Volta a ativar o teu controlo original e câmara, se quiseres
                activeCamera = FPCamera;
            });
        }
    });




    let bot1;

    loader.load('models/horse.glb', (gltf) => {
        bot1 = gltf.scene;
        bot1.scale.set(0.1, 0.1, 0.1);
        bot1.position.set(0, -20, 0);
        bot1.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting
                child.receiveShadow = true; // Enable shadow receiving
            }
        });

        scene.add(bot1);
    });

    // let bot2;

    // loader.load('models/horse.glb', (gltf) => {
    //     bot2 = gltf.scene;
    //     bot2.scale.set(0.1, 0.1, 0.1);
    //     bot2.position.set(0, -20, 0);
    //     scene.add(bot2);
    // });


    let bot2;

    loader.load('models/sea_horse.glb', (gltf) => {
        bot2 = gltf.scene;
        bot2.scale.set(3, 3, 3);
        bot2.position.set(0, -20, 0); //1.5
        bot2.rotation.y = -Math.PI / 2; // Adjust rotation if needed
        bot2.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting
                child.receiveShadow = true; // Enable shadow receiving
            }
        });
        scene.add(bot2);
    });


    // let bot3;

    // loader.load('models/horse.glb', (gltf) => {
    //     bot3 = gltf.scene;
    //     bot3.scale.set(0.1, 0.1, 0.1);
    //     bot3.position.set(0, -20, 0);
    //     scene.add(bot3);
    // });

    let bot3;
    loader.load('models/pegasus.glb', (gltf) => {
        bot3 = gltf.scene;
        bot3.scale.set(3.5, 3.5, 3.5);
        bot3.position.set(0, -20, 0); //1.5
        bot3.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting
                child.receiveShadow = true; // Enable shadow receiving
            }
        });
        scene.add(bot3);
    });


    // let pegasus;
    // loader.load('models/pegasus.glb', (gltf) => {
    //     pegasus = gltf.scene;
    //     pegasus.scale.set(3.5, 3.5, 3.5);
    //     pegasus.position.set(0, 3, 0);
    //     scene.add(pegasus);
    // });




    // const tower = createTower();
    // tower.position.set(5, 0, 5);
    // scene.add(tower);

    // Câmera em primeira pessoa
    const FPCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, SKYBOX + 100);
    FPCamera.position.set(0, 0, 0); // zera a posição dentro do holder

    // Suporte da câmera que permite rotação vertical (pitch)
    const cameraHolder = new THREE.Object3D();
    cameraHolder.position.set(0, 4, 15); // posição inicial da câmera
    cameraHolder.add(FPCamera);
    scene.add(cameraHolder);

    // Câmera de cena com OrbitControls
    const SceneCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, SKYBOX + 100);
    SceneCamera.position.set(10, 10, 20);
    const orbitControls = new OrbitControls(SceneCamera, document.body);
    orbitControls.enableDamping = true;

    let activeCamera = FPCamera;



    let keys = {};
    const speed = 0.2;

    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    // document.addEventListener('click', () => {
    //     if (activeCamera === FPCamera) {
    //         document.body.requestPointerLock();
    //     }
    //     else {
    //         document.exitPointerLock();
    //     }

    // });

    // document.addEventListener('mousemove', (event) => {
    //     if (document.pointerLockElement === document.body && activeCamera === FPCamera) {
    //         const sensitivity = 0.002;
    //         yaw -= event.movementX * sensitivity;
    //         FPCamera.rotation.set(0, yaw, 0);
    //     }
    // });
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth;
        mouseY = event.clientY / window.innerHeight;
    });


    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);

        FPCamera.aspect = width / height;
        FPCamera.updateProjectionMatrix();

        SceneCamera.aspect = width / height;
        SceneCamera.updateProjectionMatrix();

        if (myHorseCamera) {
            myHorseCamera.aspect = width / height;
            myHorseCamera.updateProjectionMatrix();
        }
    });

    function updateCameraMovement() {
        if (activeCamera !== FPCamera) return;

        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();

        const centerX = 0.5;
        const centerY = 0.5;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const deadZone = 0.10;       // Tamanho da zona morta no centro do ecrã
        const rotationSpeed = 0.1;   // Velocidade da rotação

        // Atualiza yaw apenas fora da zona morta
        if (Math.abs(deltaX) > deadZone) {
            yaw -= (deltaX - Math.sign(deltaX) * deadZone) * rotationSpeed;
        }

        // Atualiza pitch com limite, apenas fora da zona morta
        if (Math.abs(deltaY) > deadZone) {
            pitch -= (deltaY - Math.sign(deltaY) * deadZone) * rotationSpeed;

            // Limites do pitch (evita virar ao contrário)
            const maxPitch = Math.PI / 2 - 0.01;
            const minPitch = -Math.PI / 2 + 0.01;
            pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
        }

        // Aplica as rotações
        cameraHolder.rotation.set(0, yaw, 0);
        FPCamera.rotation.set(pitch, 0, 0);

        // Movimento
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
            cameraHolder.position.addScaledVector(moveDirection, speed);
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


        if (lobby.aquarium?.tick) lobby.aquarium.tick();

        renderer.render(scene, activeCamera);
    }

    // // Botão para alternar câmeras e estado do ponteiro
    // const toggleCamButton = document.createElement('button');
    // toggleCamButton.textContent = 'Alternar Câmera';
    // toggleCamButton.style.position = 'absolute';
    // toggleCamButton.style.top = '10px';
    // toggleCamButton.style.left = '10px';
    // toggleCamButton.style.padding = '10px';
    // toggleCamButton.style.background = 'black';
    // toggleCamButton.style.color = 'white';
    // toggleCamButton.style.border = 'none';
    // toggleCamButton.style.cursor = 'pointer';
    // toggleCamButton.onclick = () => {
    //     activeCamera = activeCamera === FPCamera ? SceneCamera : FPCamera;

    //     if (activeCamera === FPCamera) {
    //         document.body.requestPointerLock();
    //     } else {
    //         document.exitPointerLock();
    //     }
    // };
    // document.body.appendChild(toggleCamButton);


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

    // const startRaceButton = document.createElement('startRaceButton');
    // startRaceButton.textContent = 'Começar Corrida';
    // startRaceButton.style.position = 'absolute';
    // startRaceButton.style.top = '50px';
    // startRaceButton.style.left = '10px';
    // startRaceButton.style.padding = '10px';
    // startRaceButton.style.background = 'red';
    // startRaceButton.style.color = 'white';
    // startRaceButton.style.border = 'none';
    // startRaceButton.style.cursor = 'pointer';
    // startRaceButton.onclick = () => {
    //     myHorse.rotation.y = 0;
    //     myHorseCircle = 0;
    //     isMyHorseBusy = true;
    //     activeCamera = myHorseCamera; // Switch to horse camera
    //     document.exitPointerLock(); // Exit pointer lock mode
    //     scene.remove(lobby);
    //     scene.add(raceAssets);

    //     startRaceButton.remove();
    //     startRace(myHorse, bot1, bot2, bot3, RACEPOSITION_X, RACEPOSITION_Z);




    // };

    // document.body.appendChild(startRaceButton);
    const startRaceButton = document.createElement('button');
    startRaceButton.textContent = '(C) - Começar Corrida';
    startRaceButton.style.position = 'absolute';
    startRaceButton.style.top = '10px';
    startRaceButton.style.left = '10px';
    startRaceButton.style.padding = '10px';
    startRaceButton.style.background = 'red';
    startRaceButton.style.color = 'white';
    startRaceButton.style.border = 'none';
    startRaceButton.style.borderRadius = '8px';
    startRaceButton.style.cursor = 'default';
    startRaceButton.style.fontFamily = 'sans-serif';
    startRaceButton.style.cursor = 'pointer';
    document.body.appendChild(startRaceButton);

    startRaceButton.onclick = () => {
        myHorse.rotation.y = 0;
        myHorseCircle = 0;
        isMyHorseBusy = true;
        activeCamera = myHorseCamera; // Switch to horse camera
        document.exitPointerLock(); // Exit pointer lock mode
        scene.remove(lobby);
        scene.add(raceAssets);

        startRaceButton.remove();
        startRace(myHorse, bot1, bot2, bot3, RACEPOSITION_X, RACEPOSITION_Z);
    }


    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;

        if (event.key.toLowerCase() === 'c' && !isMyHorseBusy) {
            myHorse.rotation.y = 0;
            myHorseCircle = 0;
            isMyHorseBusy = true;
            activeCamera = myHorseCamera;
            // document.exitPointerLock();
            scene.remove(lobby);
            scene.add(raceAssets);

            startRaceButton.remove();
            startRace(myHorse, bot1, bot2, bot3, RACEPOSITION_X, RACEPOSITION_Z);
        }
    });



    window.addEventListener('raceEnded', () => {
        scene.remove(raceAssets);
        scene.add(lobby);

        isMyHorseBusy = false;
        myHorse.position.set(0, 0, 0);
        myHorse.rotation.set(0, 0, 0);
        bot1.position.set(0, -20, 0);
        bot2.position.set(0, -20, 0);
        bot3.position.set(0, -20, 0);
        myHorseCircle = 0;
        activeCamera = FPCamera;

        // Show race start button again
        document.body.appendChild(startRaceButton);
        // document.body.requestPointerLock();


    });


    animate();
}



window.onload = init;


