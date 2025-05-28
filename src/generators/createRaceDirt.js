

import * as THREE from 'three';

export function createRaceDirt() {

    const race = new THREE.Shape();
    race.moveTo(0, 0);
    race.lineTo(25, 0);
    race.lineTo(25, 500);
    race.lineTo(0, 500);
    race.lineTo(0, 0);
    const legGeomtry = new THREE.ExtrudeGeometry([race], {
        steps: 1,
        depth: .2,
        bevelEnabled: false,
        curveSegments: 32
    });

    const raceCourse = new THREE.Mesh(legGeomtry, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    raceCourse.translateY(0.2)
    raceCourse.rotateX(Math.PI/2)
    return raceCourse;
}
