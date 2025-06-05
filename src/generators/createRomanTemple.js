import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function createRomanTemple() {
    const temple = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();

    const ruinTexture = textureLoader.load('textures/ruinas2.png');
    wrapAndRepeatTexture(ruinTexture);

    const beamTexture = textureLoader.load('textures/ruinas2.png');
    wrapAndRepeatTextureBeams(beamTexture);
    const beamMaterial = new THREE.MeshStandardMaterial({ map: beamTexture });

    const floorTexture = textureLoader.load('textures/roman_floor.png');
    wrapAndRepeatTextureFloor(floorTexture);
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });

    // Load column model
    const loader = new GLTFLoader();
    const glb = await loader.loadAsync('models/greek_collumn.glb');
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
      
        }
    });
    const columnMesh = glb.scene;
    columnMesh.scale.set(0.007, 0.005, 0.007);

    const numColumnsFront = 8;
    const numColumnsSide = 5;
    const spacingX = 7;
    const spacingZ = 7;
    const offsetY = 0;

    const placeColumnsLine = (start, count, axis, fixedCoord, depth) => {
        for (let i = 0; i < count; i++) {
            const col = columnMesh.clone();
            if (axis === 'x') {
                col.position.set(start + i * spacingX, offsetY, depth);
            } else {
                col.position.set(depth, offsetY, start + i * spacingZ);
            }
            
            temple.add(col);
        }
    };

    const width = (numColumnsFront - 1) * spacingX;
    const depth = (numColumnsSide - 1) * spacingZ;

    placeColumnsLine(-width / 2, numColumnsFront, 'x', 0, -depth / 2);
    placeColumnsLine(-width / 2, numColumnsFront, 'x', 0, depth / 2);

    placeColumnsLine(-depth / 2 + spacingZ, numColumnsSide - 2, 'z', 0, -width / 2);
    // placeColumnsLine(-depth / 2 + spacingZ, numColumnsSide - 2, 'z', 0, width / 2);

    const floorGeometry = new THREE.PlaneGeometry(width + 20, depth + 20);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.05;  // altura ajustada
    floor.receiveShadow = true;
    temple.add(floor);

    const beamGeometry = new THREE.BoxGeometry(width + spacingX, 1.5, 2);
    const frontBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    frontBeam.position.set(0, 9, -depth / 2);
    const backBeam = frontBeam.clone();
    backBeam.position.z = depth / 2;
    temple.add(frontBeam, backBeam);

    const sideBeamGeometry = new THREE.BoxGeometry(2, 1.5, depth + spacingZ);
    const leftBeam = new THREE.Mesh(sideBeamGeometry, beamMaterial);
    leftBeam.position.set(-width / 2, 9, 0);
    const rightBeam = leftBeam.clone();
    rightBeam.position.x = width / 2;
    temple.add(leftBeam, rightBeam);

    const sideShape = new THREE.Shape();
    sideShape.moveTo(-depth / 2, 0);
    sideShape.lineTo(0, 3);
    sideShape.lineTo(depth / 2, 0);
    sideShape.lineTo(-depth / 2, 0);

    const extrudeSettings = {
        steps: 1,
        depth: 1.5,
        bevelEnabled: false
    };

    const pedimentMaterial = new THREE.MeshStandardMaterial({ map: ruinTexture });
    const sideGeometry = new THREE.ExtrudeGeometry(sideShape, extrudeSettings);

    const leftPediment = new THREE.Mesh(sideGeometry, pedimentMaterial);
    leftPediment.rotation.y = Math.PI / 2;
    leftPediment.position.set(-width / 2-0.5, 9.71, 0);
    temple.add(leftPediment);

    const rightPediment = leftPediment.clone();
    rightPediment.position.set(width / 2+0.5, 9.71, 0);
    rightPediment.rotation.y = -Math.PI / 2;
    temple.add(rightPediment);

    return temple;

    
}

function wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(0.3, 0.6);
}

function wrapAndRepeatTextureBeams(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(15, 0.4);  // menos esticado nas beams
}

function wrapAndRepeatTextureFloor(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(20, 20);  
}
