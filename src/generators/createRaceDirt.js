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
  

    const group = new THREE.Group();
    group.add(raceCourse);

    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const stripeWidth = 0.05;     // altura (evitar clipping)
    const stripeThickness = 1;    
    const stripeLength = 500;    
    const stripeGeometry = new THREE.BoxGeometry(stripeThickness, stripeWidth, stripeLength);

    for (let x = 0; x <= 25; x += 25/4) {
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(x + stripeThickness / 2, 0.25 + stripeWidth / 2, 250);
        group.add(stripe);
    }

    return group;
}
