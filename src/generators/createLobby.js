import * as THREE from 'three';
import { createRally } from './createFence.js';
import { createHayBlock } from './createHayBlock.js';
import { createFeeder } from './createFeeder.js';
import { createTree } from './createTree.js';

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

    let treeCount = 35;
    for (let i = 0; i < treeCount; i++) {
        let x, z;
        do {
            const angle = Math.random() * Math.PI * 2;
            const distance = (Math.random() * 50) + Math.max(width * 2, length * 2) + 10;
            x = Math.cos(angle) * distance;
            z = Math.sin(angle) * distance;
        } while (x > 45 && x < 80); 

        const tree = await createTree(x, z);

        const scale = 0.4 + Math.random() * 0.6;
        tree.scale.set(scale, scale, scale);

        tree.rotation.y = Math.random() * Math.PI * 2;

        Lobby.add(tree);
    }

    return Lobby;
}

