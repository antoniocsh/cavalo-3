

import * as THREE from 'three';

export function createFeeder() {

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0xfafafa,     
        metalness: 0.6,      
        roughness: 0.2       
    });

    const feeder = new THREE.Object3D();
    const wallShape = new THREE.Shape();
    wallShape.moveTo(0, 0);
    wallShape.lineTo(5, 0);
    wallShape.lineTo(5, 1.5);
    wallShape.lineTo(0, 1.5);
    wallShape.lineTo(0, 0);
    const wallGeometry = new THREE.ExtrudeGeometry([wallShape], {
        steps: 1,
        depth: .2,
        bevelEnabled: false,
        curveSegments: 32
    });
    const wallA = new THREE.Mesh(wallGeometry,metalMaterial);
    wallA.translateZ(.8);
    wallA.translateY(0.4);
    feeder.add(wallA);

    const wallB = wallA.clone();
    wallB.translateZ(-1.8);
    feeder.add(wallB);

    const otherwallShape = new THREE.Shape();
    otherwallShape.moveTo(0, 0);
    otherwallShape.lineTo(2, 0);
    otherwallShape.lineTo(2, 1.5);
    otherwallShape.lineTo(0, 1.5);
    otherwallShape.lineTo(0, 0);
    const otherwallGeometry = new THREE.ExtrudeGeometry([otherwallShape], {
        steps: 1,
        depth: .2,
        bevelEnabled: false,
        curveSegments: 32
    });

    const wallC = new THREE.Mesh(otherwallGeometry, metalMaterial);
    wallC.rotateY(Math.PI/2);
    wallC.translateX(-1);
    wallC.translateY(0.4);
    feeder.add(wallC);

    const wallD = wallC.clone();
    wallD.translateZ(5);
    feeder.add(wallD);

    const floorShape = new THREE.Shape();

    floorShape.moveTo(0, 0);
    floorShape.lineTo(5, 0);
    floorShape.lineTo(5, 2);
    floorShape.lineTo(0, 2);
    floorShape.lineTo(0, 0);
    const floorShapeGeometry = new THREE.ExtrudeGeometry([floorShape], {
        steps: 1,
        depth: .2,
        bevelEnabled: false,
        curveSegments: 32
    });

    const floor = new THREE.Mesh(floorShapeGeometry, metalMaterial);
    floor.translateY(0.4)
    floor.translateZ(1)
    floor.rotateX(-Math.PI/2)
    feeder.add(floor);

    const leg = new THREE.Shape();
    leg.moveTo(0, 0);
    leg.lineTo(0.2, 0);
    leg.lineTo(0.2, 1);
    leg.lineTo(0, 1);
    leg.lineTo(0, 0);
    const legGeomtry = new THREE.ExtrudeGeometry([leg], {
        steps: 1,
        depth: .2,
        bevelEnabled: false,
        curveSegments: 32
    });

    const legA = new THREE.Mesh(legGeomtry, metalMaterial);
    legA.translateZ(0.8);
    feeder.add(legA);

    const legB = legA.clone();
    legB.translateZ(-1.8);
    feeder.add(legB);

    const legC = legB.clone();
    legB.translateX(5);
    feeder.add(legC);

    const legD = legA.clone();
    legD.translateX(5);
    feeder.add(legD);


// Adiciona a água
const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.4
});

const waterGeometry = new THREE.BoxGeometry(4.8, 0.9, 1.8); // largura, altura, profundidade
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.position.set(2.7, 0.8, 0); // centralizado dentro do feeder, ajustado em Y para parecer "cheio"

feeder.add(water);



    return feeder;
}
