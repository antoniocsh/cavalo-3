import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function createHorseAccessories(myHorse, accessoriesList) {
    if (myHorse.horseAccessories) {
        myHorse.remove(myHorse.horseAccessories);
        myHorse.horseAccessories.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    const accessories = new THREE.Object3D();
    const loader = new GLTFLoader();

    const enableShadows = (object) => {
        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    };

    const loadModel = (path, scale, position, rotation = null) => {
        return new Promise((resolve, reject) => {
            loader.load(path, (gltf) => {
                const model = gltf.scene;
                model.scale.set(...scale);
                model.position.set(...position);
                if (rotation) {
                    model.rotation.set(...rotation);
                }
                enableShadows(model);
                resolve(model);
            }, undefined, reject);
        });
    };

    const accessoryData = {
        head: {
            witch_hat: { path: 'models/witch_hat.glb', scale: [0.6, 0.6, 0.6], position: [0, 5.2, 2.2] },
            cap: { path: 'models/cap.glb', scale: [2.4, 2.4, 2.4], position: [0, 5.2, 1.95] },
            crown: { path: 'models/crown.glb', scale: [0.35, 0.3, 0.35], position: [0, 5.4, 2.1] }
        },
        body: {
            witch_broom: { path: 'models/witches_broom.glb', scale: [0.01, 0.01, 0.01], position: [2.1, 0.5, 0]},
            sword: { path: 'models/sword.glb', scale: [1, 1, 1], position: [1, 4, 0], rotation: [Math.PI / 2, Math.PI / 4, 0] }
        },
        shoes: {}
    };

    const addAccessory = async (category, name) => {
        if (name && accessoryData[category] && accessoryData[category][name]) {
            const data = accessoryData[category][name];
            const baseModel = await loadModel(data.path, data.scale, data.position, data.rotation);
               if (category === 'body' && name === 'sword') {    
                const sword2 = baseModel.clone();
                sword2.position.set(data.position[0] + 0.2, data.position[1] - 0.6, data.position[2]); // um pouco abaixo
                sword2.rotation.set(Math.PI/2, -Math.PI/4, 0);
                accessories.add(sword2);
    
                const sword3 = baseModel.clone();
                sword3.position.set(-data.position[0], data.position[1], data.position[2]); // outro lado
                sword3.rotation.set(...(data.rotation || [0, 0, 0]));
                accessories.add(sword3);
    
                const sword4 = baseModel.clone();
                sword4.position.set(-data.position[0]-0.2, data.position[1] - 0.6, data.position[2]); // outro lado e mais abaixo
                sword4.rotation.set(...(data.rotation || [0, 0, 0]));
                accessories.add(sword4);


                baseModel.rotation.set(Math.PI/2, -Math.PI/4, 0);

                accessories.add(baseModel);
            } else {
                accessories.add(baseModel);
            }
        }
    };

    await Promise.all([
        addAccessory('head', accessoriesList.head),
        addAccessory('body', accessoriesList.body),
        addAccessory('shoes', accessoriesList.shoes),
    ]);

    myHorse.add(accessories);
    myHorse.horseAccessories = accessories;
}
