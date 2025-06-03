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
    infoDiv.style.left = '10px';
    infoDiv.style.color = 'white';
    infoDiv.style.fontSize = '20px';
    infoDiv.style.fontFamily = 'sans-serif';
    document.body.appendChild(infoDiv);


    // Criar Raycaster para clique
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Pegasus modelo cache
    let pegasusModel = null;
    let pegasusModelLoaded = false;

    loader.load('models/pegasus.glb', (gltf) => {
        pegasusModel = gltf.scene;
        pegasusModel.scale.set(3.5, 3.5, 3.5);
        pegasusModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        pegasusModelLoaded = true;
    });

    // Função para criar um Pegasus
    function createPegasus(isPink = false) {
        if (!pegasusModelLoaded) return null;
        const peg = pegasusModel.clone(true);
        if (isPink) {
            peg.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.color = new THREE.Color(0xff00b3);
                }
            });
        }
        peg.position.set(
            (Math.random() - 0.5) * 50,
            Math.random() * 20 + 5,
            (Math.random() - 0.5) * 50
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

    // Cria novo Pegasus a cada ~1 segundo
    let lastSpawnTime = 0;
    const spawnInterval = 1000;

    // Configura camera para fixa e parada
    const originalPosition = camera.position.clone();
    const originalRotation = camera.rotation.clone();
    camera.position.set(0, 10, 30);
    camera.lookAt(new THREE.Vector3(0, 10, 0));


    // Atualiza texto info
    function updateInfo() {
        infoDiv.textContent = `Pontos: ${points}   Vidas: ${lives}`;
    }
    updateInfo();

    // Função para terminar o jogo
    function endGame() {
        gameActive = false;
        infoDiv.textContent = `Fim de jogo! Pontos: ${points}`;
        // Limpar pegasus
        pegasusList.forEach(p => pegasusGroup.remove(p));
        pegasusList = [];
        // Remove info após algum tempo
        setTimeout(() => {
            if (infoDiv.parentElement) {
                infoDiv.parentElement.removeChild(infoDiv);
            }
            // Retorna câmera ao estado original
            camera.position.copy(originalPosition);
            camera.rotation.copy(originalRotation);
            if (onGameEnd) onGameEnd(points);
        }, 5000);
    }

    // Click handler para destruir Pegasus
    function onClick(event) {
        if (!gameActive) return;
        // Calcula coordenadas normalizadas do mouse
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pegasusGroup.children, true);

        if (intersects.length > 0) {
            // Descobre o Pegasus clicado (objeto mais próximo)
            let clickedPegasus = intersects[0].object;
            while (clickedPegasus.parent && clickedPegasus.parent !== pegasusGroup) {
                clickedPegasus = clickedPegasus.parent;
            }
            // Remove Pegasus
            pegasusGroup.remove(clickedPegasus);
            pegasusList = pegasusList.filter(p => p !== clickedPegasus);
            points += 1;

            // Chance de dar vida extra
            if (clickedPegasus.userData.isPink && lives < 3) {
                if (Math.random() < 0.05) {
                    lives += 1;
                }
            }

            updateInfo();
        }
    }

    window.addEventListener('click', onClick);

    // Atualização do jogo
    function update() {
        if (!gameActive) return;

        const now = performance.now();

        // Spawn novo Pegasus
        if (now - lastSpawnTime > spawnInterval && pegasusModelLoaded) {
            lastSpawnTime = now;
            // 5% chance de ser rosa
            const isPink = Math.random() < 0.05 && lives < 3;
            createPegasus(isPink);
        }

        // Atualiza posições dos Pegasuses e verifica tempo de vida
        for (let i = pegasusList.length - 1; i >= 0; i--) {
            const p = pegasusList[i];
            // Movimento aleatório
            p.position.add(p.userData.velocity);
            // Reflete se bater nas bordas +-25
            ['x', 'y', 'z'].forEach(axis => {
                if (p.position[axis] > 25 || p.position[axis] < -25) {
                    p.userData.velocity[axis] *= -1;
                }
            });
            // Checa tempo de vida
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

    // Loop de animação dedicado
    function animate() {
        if (!gameActive) return;
        requestAnimationFrame(animate);
        update();
        renderer.render(scene, camera);
    }
    animate();

    // Retorna função para terminar manualmente, se necessário
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
