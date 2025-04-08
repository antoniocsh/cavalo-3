

import * as THREE from 'three';

export function createFeeder() {

    const feeder = new THREE.Object3D();
    


    // Draw side walls
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
    const wallA = new THREE.Mesh(wallGeometry, new THREE.MeshStandardMaterial({ color: 0xff9999 }));
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

    const wallC = new THREE.Mesh(otherwallGeometry, new THREE.MeshStandardMaterial({ color: 0xff000 }));
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

    const floor = new THREE.Mesh(floorShapeGeometry, new THREE.MeshStandardMaterial({ color: 0xffff00 }));
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

    const legA = new THREE.Mesh(legGeomtry, new THREE.MeshStandardMaterial({ color: 0xff00ff }));
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





    return feeder;
}
