import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createLobby } from './generators/createLobby.js';
import { startRace } from './game_logic/horseRace.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { createRaceAssets } from './generators/createRaceAssets.js';
import { startPegasusHunt } from './game_logic/pegasusHunt.js';

import { createRomanTemple } from './generators/createRomanTemple.js';
import { createHorseAccessories } from './generators/createHorseAccessories.js';

import { generateFloor } from './generators/generateFloor.js';
async function init() {
    let yaw = 0;
    let pitch = 0;
    let mouseX = 0.5; 
    let mouseY = 0.5; 
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

    const temple = await createRomanTemple();

    const raceAssets = await createRaceAssets(RACEPOSITION_X, RACEPOSITION_Z);
   
    const grassfloor = await generateFloor();
    scene.add(grassfloor);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

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

        myHorseCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, SKYBOX);
        myHorseCamera.position.set(0, 6, 0); 
        myHorseCamera.lookAt(horseModel.position.clone().add(new THREE.Vector3(0, 5, 5))); // Face forward

        myHorse.add(myHorseCamera);
        scene.add(myHorse);
        const horseAccessories = JSON.parse(localStorage.getItem('myHorseAccessories') || '{"head": "", "body": "", "shoes": ""}');
        if (horseAccessories) {
            createHorseAccessories(myHorse, horseAccessories);
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

    let pegasusGameInstance = null;

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p' && !pegasusGameInstance && !isMyHorseBusy) {
            isMyHorseBusy = true;
            //retirar o meu cavalo 
            if (myHorse) {
                myHorse.position.set(0, -20, 0); 
            }

            activeCamera = SceneCamera;
            scene.remove(grassfloor);
            scene.remove(lobby);

            scene.add(temple);

            pegasusGameButton.remove();
            startRaceButton.remove();

            pegasusGameInstance = startPegasusHunt(scene, activeCamera, renderer, (finalPoints) => {
                console.log(`Pegasus Game Ended with points: ${finalPoints}`);

                const currentCoins = parseInt(localStorage.getItem('horsecoin') || '0', 10);
                const newTotal = currentCoins + finalPoints;
                localStorage.setItem('horsecoin', newTotal.toString());
                console.log(`HorseCoins updated: ${newTotal}`);

                pegasusGameInstance = null;
                isMyHorseBusy = false;

                document.body.appendChild(pegasusGameButton);
                document.body.appendChild(startRaceButton);

                scene.remove(temple);
                scene.add(grassfloor);
                scene.add(lobby);

                if (myHorse) {
                    myHorse.position.set(0, 0, 0);
                    myHorse.rotation.set(0, 0, 0);
                }

                activeCamera = FPCamera;
            });

        }
    });
    
    // Câmera em primeira pessoa
    const FPCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, SKYBOX + 100);
    FPCamera.position.set(0, 0, 0);

    const cameraHolder = new THREE.Object3D();
    cameraHolder.position.set(0, 4, 15); 
    cameraHolder.add(FPCamera);
    scene.add(cameraHolder);

    const SceneCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, SKYBOX + 100);
    SceneCamera.position.set(27, 5, 0);
    SceneCamera.lookAt(new THREE.Vector3(0, 3, 0));

    let activeCamera = FPCamera;

    let keys = {};
    const speed = 0.2;

    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });

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

        if (Math.abs(deltaX) > deadZone) {
            yaw -= (deltaX - Math.sign(deltaX) * deadZone) * rotationSpeed;
        }

        if (Math.abs(deltaY) > deadZone) {
            pitch -= (deltaY - Math.sign(deltaY) * deadZone) * rotationSpeed;

            const maxPitch = Math.PI / 2 - 0.01;
            const minPitch = -Math.PI / 2 + 0.01;
            pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
        }

        cameraHolder.rotation.set(0, yaw, 0);
        FPCamera.rotation.set(pitch, 0, 0);

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

    const horsecoinDisplay = document.createElement('div');
    horsecoinDisplay.style.position = 'absolute';
    horsecoinDisplay.style.top = '10px';
    horsecoinDisplay.style.right = '10px';
    horsecoinDisplay.style.color = 'white';
    horsecoinDisplay.style.background = 'black';
    horsecoinDisplay.style.padding = '10px';
    horsecoinDisplay.style.fontFamily = 'monospace';
    document.body.appendChild(horsecoinDisplay);

    function updateHorsecoinUI() {
        const coins = localStorage.getItem('horsecoin') || '0';
        horsecoinDisplay.textContent = `HorseCoins: ${coins}`;
    }

    setInterval(updateHorsecoinUI, 1000);

    const pegasusGameButton = document.createElement('button');
    pegasusGameButton.textContent = '(P) - Combater Pégasus';
    pegasusGameButton.style.position = 'absolute';
    pegasusGameButton.style.top = '50px';
    pegasusGameButton.style.left = '10px';
    pegasusGameButton.style.padding = '10px';
    pegasusGameButton.style.background = 'blue';
    pegasusGameButton.style.color = 'white';
    pegasusGameButton.style.border = 'none';
    pegasusGameButton.style.borderRadius = '8px';
    pegasusGameButton.style.cursor = 'default';
    pegasusGameButton.style.fontFamily = 'sans-serif';
    pegasusGameButton.style.cursor = 'pointer';
    document.body.appendChild(pegasusGameButton);


    const accessoriesButton = document.createElement('button');
    accessoriesButton.textContent = '(H) - Acessórios';
    accessoriesButton.style.position = 'absolute';
    accessoriesButton.style.bottom = '10px';
    accessoriesButton.style.left = '10px';
    accessoriesButton.style.padding = '10px';
    accessoriesButton.style.background = 'purple';
    accessoriesButton.style.color = 'white';
    accessoriesButton.style.border = 'none';
    accessoriesButton.style.cursor = 'pointer';
    accessoriesButton.style.borderRadius = '8px';
    document.body.appendChild(accessoriesButton);

    const accessoriesModal = document.createElement('div');
    accessoriesModal.style.position = 'fixed';
    accessoriesModal.style.top = '0';
    accessoriesModal.style.left = '0';
    accessoriesModal.style.width = '100%';
    accessoriesModal.style.height = '100%';
    accessoriesModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    accessoriesModal.style.display = 'none';
    accessoriesModal.style.flexDirection = 'column';
    accessoriesModal.style.alignItems = 'center';
    accessoriesModal.style.justifyContent = 'center';
    accessoriesModal.style.zIndex = '1000';
    accessoriesModal.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    accessoriesModal.innerHTML = `
      <div style="
        background: #f0f0f3;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
        max-width: 420px;
        width: 90%;
        text-align: center;
        color: #333;
      ">
        <h2 style="margin-bottom: 20px; color: #4b4b8f;">🎨 Selecionar Acessórios</h2>
        
        <label style="display: block; margin-bottom: 15px; text-align: left;">
          <strong>👒 Head:</strong><br>
          <select id="head-select" style="
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            border: none;
            background: #e0e0e0;
            font-size: 14px;
            margin-top: 5px;
          ">
            <option value="none">None</option>
            <option value="witch_hat">Witch Hat</option>
            <option value="cap">Cap</option>
            <option value="crown">Crown</option>
          </select>
        </label>
    
        <label style="display: block; margin-bottom: 15px; text-align: left;">
          <strong>🧥 Body:</strong><br>
          <select id="body-select" style="
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            border: none;
            background: #e0e0e0;
            font-size: 14px;
            margin-top: 5px;
          ">
            <option value="none">None</option>
            <option value="witch_broom">Witch Broom</option>
            <option value="sword">Sword</option>
          </select>
        </label>
    
       
    
        <button id="confirm-accessories" style="
          background: linear-gradient(to right, #7b5cff, #7e8fff);
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: background 0.3s ease;
        ">
          ✅ Confirmar
        </button>
      </div>
    `;


    document.body.appendChild(accessoriesModal);

    // <label>Shoes:
    //     <select id="shoes-select">
    //         <option value="none">None</option>
    //         <option value="boots">boots</option>
    //         <option value="flip_flops">Flip Flops</option>
    //         <option value="fancy">fancy</option>
    //     </select>
    // </label><br><br>
    // Mostrar modal ao clicar no botão

    //     <label style="display: block; margin-bottom: 25px; text-align: left;">
    //     <strong>👢 Shoes:</strong><br>
    //     <select id="shoes-select" style="
    //       width: 100%;
    //       padding: 10px;
    //       border-radius: 10px;
    //       border: none;
    //       background: #e0e0e0;
    //       font-size: 14px;
    //       margin-top: 5px;
    //     ">
    //       <option value="none">None</option>
    //       <!-- Adicione opções de sapato aqui se desejar -->
    //     </select>
    //   </label>
    accessoriesButton.onclick = () => {
        accessoriesModal.style.display = 'flex';
    };

    document.getElementById('confirm-accessories').onclick = async () => {
        const head = document.getElementById('head-select').value;
        const body = document.getElementById('body-select').value;
        // const shoes = document.getElementById('shoes-select').value;

        const selectedAccessories = {
            head: head === 'none' ? '' : head,
            body: body === 'none' ? '' : body,
            // shoes: shoes === 'none' ? '' : shoes
        };

        localStorage.setItem('myHorseAccessories', JSON.stringify(selectedAccessories));

        if (myHorse) {
            await createHorseAccessories(myHorse, selectedAccessories);
        }

        accessoriesModal.style.display = 'none';
        isMyHorseBusy = false; // Allow other actions after confirming accessories
    };

    window.addEventListener('load', async () => {
        const savedAccessories = JSON.parse(localStorage.getItem('myHorseAccessories') || '{"head": "", "body": "", "shoes": ""}');

        if (myHorse) {
            await createHorseAccessories(myHorse, savedAccessories);
        } else {
            const checkHorseInterval = setInterval(async () => {
                if (myHorse) {
                    await createHorseAccessories(myHorse, savedAccessories);
                    clearInterval(checkHorseInterval);
                }
            }, 500);
        }
    });

    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
        if (event.key.toLowerCase() === 'h') {
            if (!isMyHorseBusy) {
                isMyHorseBusy = true; // Prevent other actions while in accessories modal
                accessoriesModal.style.display = 'flex';

            }
        }
    }
    );

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
        pegasusGameButton.remove();
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
            pegasusGameButton.remove();

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

        document.body.appendChild(startRaceButton);
        document.body.appendChild(pegasusGameButton);
    });


    animate();
}



window.onload = init;


