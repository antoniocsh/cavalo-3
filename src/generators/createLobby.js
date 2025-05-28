import * as THREE from 'three';
import { createRally } from './createFence.js';
import { createHayBlock } from './createHayBlock.js';
import { createFeeder } from './createFeeder.js';
import { createTree } from './createTree.js';
import { createRaceDirt } from './createRaceDirt.js';

export async function createLobby(width, length, RACEPOSITION_X, RACEPOSITION_Z) {
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
    
    
    treeCount = 50;
    const minX = 47;
    const maxX = 78;
    const minZ = -255;
    const maxZ = 255;
    const marginMax = 30;
    
    const zMinCentral = minZ + 20;  // -200
    const zMaxCentral = maxZ - 20;  // 200
    
    let countNearTop = 0;   
    let countNearBottom = 0;
    
    for (let i = 0; i < treeCount; i++) {
        let x, z;
        let side;
    
   
        while (true) {
            side = Math.floor(Math.random() * 4);
    
            if (side === 2 && countNearTop >= 2) continue;    
            if (side === 3 && countNearBottom >= 2) continue; 
    
            break;
        }
    
        switch(side) {
            case 0: 
                x = minX - (Math.random() * 15); ;
                z = zMinCentral + Math.random() * (zMaxCentral - zMinCentral);
                break;
            case 1: 
                x = maxX + (Math.random() * marginMax);
                z = zMinCentral + Math.random() * (zMaxCentral - zMinCentral);
                break;
            case 2:
                x = minX + Math.random() * (maxX - minX);
                z = maxZ + (Math.random() * marginMax);
                countNearTop++;
                break;
            case 3: 
                x = minX + Math.random() * (maxX - minX);
                z = minZ - (Math.random() * marginMax);
                countNearBottom++;
                break;
        }
    
        const tree = await createTree(x, z);
    
        const scale = 0.4 + Math.random() * 0.6;
        tree.scale.set(scale, scale, scale);
    
        tree.rotation.y = Math.random() * Math.PI * 2;
    
        Lobby.add(tree);
    }
    

    const race = createRaceDirt();
    race.translateX(RACEPOSITION_X);
    race.translateY(RACEPOSITION_Z);
    Lobby.add(race);

    return Lobby;
}

