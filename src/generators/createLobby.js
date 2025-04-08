import * as THREE from 'three';
import { createRally } from './createFence.js';
import { createHayBlock } from './createHayBlock.js';
import { createFeeder } from './createFeeder.js';
import { createTree } from './createTree.js';
import { createRaceDirt } from './createRaceDirt.js';

export async function createLobby(width, length) {
    const Lobby = new THREE.Object3D();

    const fences = createRally(width, length);
    Lobby.add(fences);

    const hay_1 = createHayBlock(5, 2, 2, 23.5, 0, 25);
    Lobby.add(hay_1);

    const feeder = createFeeder();
    feeder.translateZ(24.9);
    feeder.translateX(14);
    Lobby.add(feeder);

    // Criar árvores ao redor do ringue
    const treeCount = 35; // Número total de árvores
    const trees = [];

    for (let i = 0; i < treeCount; i++) {
        // Posicionamento aleatório ao redor do ringue
        const angle = Math.random() * Math.PI * 2; // Ângulo aleatório
        const distance = (Math.random() * 50) + Math.max(width * 2, length * 2) + 10; // Distância aleatória além do ringue
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        // Criar e posicionar árvore
        const tree = await createTree(x, z);
        
        // Escala aleatória para variação de tamanho
        const scale = 0.4 + Math.random() * 0.6; // Entre 0.4 e 1
        tree.scale.set(scale, scale, scale);

        // Rotação aleatória para cada árvore
        tree.rotation.y = Math.random() * Math.PI * 2; // Rotação entre 0 e 360 graus

        trees.push(tree);
        Lobby.add(tree);
    }

    const race = createRaceDirt();
    race.translateX(50);
    Lobby.add(race);

    return Lobby;
}
