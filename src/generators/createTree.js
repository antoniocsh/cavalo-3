import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createTree(x = 0, z = 0) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load('models/giant_tree.glb', (gltf) => {
            const tree = gltf.scene;
            tree.position.set(x, 0, z);
            resolve(tree);
        }, undefined, reject);
    });
}
