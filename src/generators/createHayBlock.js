
import * as THREE from 'three';

export function createHayBlock(width = 1, height = 1, depth = 1, x = 0, y = 0, z = 0) {
    const textureLoader = new THREE.TextureLoader();
    const hayTexture = textureLoader.load('../../public/textures/hay.jpg');
    hayTexture.wrapS = THREE.RepeatWrapping;
    hayTexture.wrapT = THREE.RepeatWrapping;
    hayTexture.repeat.set(width, height);

    const hayMaterial = new THREE.MeshBasicMaterial({ map: hayTexture });
    const hayGeometry = new THREE.BoxGeometry(width, height, depth);
    const hayBlock = new THREE.Mesh(hayGeometry, hayMaterial);
    hayBlock.position.set(x, (y + height) / 2, z);

    return hayBlock;
}
