import * as THREE from 'three';
import { createTree } from './createTree.js';
import { createRaceDirt } from './createRaceDirt.js';

export async function createRaceAssets(RACEPOSITION_X, RACEPOSITION_Z) {
    const Race = new THREE.Object3D();
    const treeCount = 50;
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
    
        Race.add(tree);
    }
    

    const race = createRaceDirt();
    race.translateX(RACEPOSITION_X);
    race.translateZ(RACEPOSITION_Z);
    Race.add(race);

    return Race;
}

