import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function startPegasusHunt(scene, camera, renderer, onGameEnd) {
    // Estado do jogo
    let lives = 3;
    let points = 0;
    let pegasusList = [];
    let gameActive = true;

    // Grupo para Pegasuses
    const pegasusGroup = new THREE.Group();
    scene.add(pegasusGroup);

    const loader = new GLTFLoader();

    // Para texto na tela
    let infoDiv = document.createElement('div');
    infoDiv.style.position = 'absolute';
    infoDiv.style.top = '10px';
    infoDiv.style.left = '50%';
    infoDiv.style.transform = 'translateX(-50%)';
    infoDiv.style.color = 'white';
    infoDiv.style.fontSize = '24px';
    infoDiv.style.fontFamily = 'sans-serif';
    infoDiv.style.textAlign = 'center';
    infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    infoDiv.style.padding = '8px 16px';
    infoDiv.style.borderRadius = '8px';

    document.body.appendChild(infoDiv);


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let pegasusModel = null;
    let pegasusModelLoaded = false;

    loader.load('models/pegasus.glb', (gltf) => {
        pegasusModel = gltf.scene;
        pegasusModel.scale.set(3, 3, 3);
        pegasusModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        pegasusModelLoaded = true;
    });

    function createPegasus(isPink = false) {
        if (!pegasusModelLoaded) return null;
        const peg = pegasusModel.clone(true);
        if (isPink) {
            peg.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.color = new THREE.Color(0xff00b3);
                    child.material.emissive = new THREE.Color(0xff00b3); // brilho rosa
                    child.material.emissiveIntensity = 1;
                }
            });
        }
        peg.position.set(
            // x: -20 to 10
            Math.random() * 30 - 20, // x: -20 to 10
            Math.random() * 12,         // y: 0 to 10
            Math.random() * 24 - 12     // z: -10 to 10
        );
        peg.rotation.set(
            0,Math.PI/2,0
        );
        peg.userData = {
            isPink,
            lifeStart: performance.now(),
            lifeDuration: 4000,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            )
        };
        pegasusGroup.add(peg);
        pegasusList.push(peg);
        return peg;
    }

    let lastSpawnTime = 0;
    const spawnInterval = 1000;

    const originalPosition = camera.position.clone();
    const originalRotation = camera.rotation.clone();


    function updateInfo() {
        const hearts = '❤️'.repeat(lives);
        infoDiv.innerHTML = `Pontos: <strong>${points}</strong> &nbsp;&nbsp; ${hearts}`;
    }
    updateInfo();

    function endGame() {
        gameActive = false;
        infoDiv.innerHTML = `<strong>Fim de jogo!</strong><br/>Pontos: ${points}`;
        pegasusList.forEach(p => pegasusGroup.remove(p));
        pegasusList = [];

        setTimeout(() => {
            if (infoDiv.parentElement) {
                infoDiv.parentElement.removeChild(infoDiv);
            }

            camera.position.copy(originalPosition);
            camera.rotation.copy(originalRotation);

            if (onGameEnd) onGameEnd(points);

            const event = new Event('pegasusEnded');
            window.dispatchEvent(event);

        }, 5000);
    }

    function onClick(event) {
        if (!gameActive) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pegasusGroup.children, true);

        if (intersects.length > 0) {
            let clickedPegasus = intersects[0].object;
            while (clickedPegasus.parent && clickedPegasus.parent !== pegasusGroup) {
                clickedPegasus = clickedPegasus.parent;
            }
            pegasusGroup.remove(clickedPegasus);
            pegasusList = pegasusList.filter(p => p !== clickedPegasus);
            points += 1;

            if (clickedPegasus.userData.isPink && lives < 3) {
                lives += 1;

            }

            updateInfo();
        }
    }

    window.addEventListener('click', onClick);

    function update() {
        if (!gameActive) return;

        const now = performance.now();

        if (now - lastSpawnTime > spawnInterval && pegasusModelLoaded) {
            lastSpawnTime = now;
            // 5% chance de ser rosa
            const isPink = Math.random() < 0.05 && lives < 3;
            createPegasus(isPink);
        }

        for (let i = pegasusList.length - 1; i >= 0; i--) {
            const p = pegasusList[i];
            p.position.add(p.userData.velocity);
            if (p.position.x > 10 || p.position.x < -20) {
                p.userData.velocity.x *= -1;
            }
            if (p.position.y > 12 || p.position.y < 0) {
                p.userData.velocity.y *= -1;
            }
            if (p.position.z > 13 || p.position.z < -13) {
                p.userData.velocity.z *= -1;
            }


            if (now - p.userData.lifeStart > p.userData.lifeDuration) {
                // Remove e perde vida
                pegasusGroup.remove(p);
                pegasusList.splice(i, 1);
                lives -= 1;
                updateInfo();
                if (lives <= 0) {
                    endGame();
                    break;
                }
            }
        }
    }

    function animate() {
        if (!gameActive) return;
        requestAnimationFrame(animate);
        update();
        renderer.render(scene, camera);
    }
    animate();

    return {
        stop: () => {
            gameActive = false;
            window.removeEventListener('click', onClick);
            if (infoDiv.parentElement) {
                infoDiv.parentElement.removeChild(infoDiv);
            }
            camera.position.copy(originalPosition);
            camera.rotation.copy(originalRotation);
            pegasusList.forEach(p => pegasusGroup.remove(p));
            pegasusList = [];
        }
    };
}
