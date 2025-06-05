import * as THREE from 'three';

export async function generateFloor() {
    const textureLoader = new THREE.TextureLoader();
    // const placeholder = textureLoader.load("textures/placeholder.png");
    const placeholder = textureLoader.load("textures/grass.png");


    const WIDTH = 700;
    const LENGTH = 700;

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial(
        {
            map: placeholder
        })
    wrapAndRepeatTexture(material.map)
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2

    return floor
}

function wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 300
}