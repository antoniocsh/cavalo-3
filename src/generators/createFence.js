import * as THREE from 'three';

export function createFence(x = 0, z = 0, orientation = 1) {

    const fence = new THREE.Object3D();

    const height = 3;
    const width = 0.5;

    const woodVertical = createVerticalPart(width, height);
    fence.add(woodVertical);

    if (orientation == 0){
        const woodHorizontal1 = createHorizontalPart(width, height); 
        woodHorizontal1.position.set(height/2+width/2, height/5, 0)
    
        const woodHorizontal2 = createHorizontalPart(width, height);
        woodHorizontal2.position.set(height/2+width/2, - height/5, 0)

        fence.add(woodHorizontal1)
        fence.add(woodHorizontal2)    

    }

    else{
        const woodHorizontal1 = createHorizontalPart(width, height, orientation); 
        woodHorizontal1.position.set(0, height/5, height/2+width/2)
    
        const woodHorizontal2 = createHorizontalPart(width, height, orientation);
        woodHorizontal2.position.set(0, - height/5, height/2+width/2)

        fence.add(woodHorizontal1)
        fence.add(woodHorizontal2)    

    }
   
    fence.position.set(x, height/ 2, z);

    return fence;
}

function createVerticalPart(width, height){
    const textureLoader = new THREE.TextureLoader();
    const woodVerticalTexture = textureLoader.load('../textures/wood.jpg');
    woodVerticalTexture.wrapS = THREE.RepeatWrapping;
    woodVerticalTexture.wrapT = THREE.RepeatWrapping;
    woodVerticalTexture.repeat.set(width, height);

    const woodVerticalMaterial = new THREE.MeshBasicMaterial({ map: woodVerticalTexture });
    const woodVerticalGeometry = new THREE.BoxGeometry(width, height, 0.5);
    const woodVertical = new THREE.Mesh(woodVerticalGeometry, woodVerticalMaterial);
    return woodVertical;

}


function createHorizontalPart(width, height, orientation = 0){
    const textureLoader = new THREE.TextureLoader();

    const woodHorizontalTexture = textureLoader.load('../textures/wood2.jpg');
    woodHorizontalTexture.wrapS = THREE.RepeatWrapping;
    woodHorizontalTexture.wrapT = THREE.RepeatWrapping;
    woodHorizontalTexture.repeat.set(width, height);


    const woodHorizontalMaterial = new THREE.MeshBasicMaterial({ map: woodHorizontalTexture });

    if (orientation == 0){
    const woodHorizontalGeometry = new THREE.BoxGeometry(height, width, width/2);
    const woodHorizontal = new THREE.Mesh(woodHorizontalGeometry, woodHorizontalMaterial);
    
    return woodHorizontal;}

    else{
    const woodHorizontalGeometry = new THREE.BoxGeometry(width/2, width, height);
    const woodHorizontal = new THREE.Mesh(woodHorizontalGeometry, woodHorizontalMaterial);
    
    return woodHorizontal;

    }
    
}


export function createRally(width, length) {
    const rally = new THREE.Object3D();
    const fenceSpacing = 3.5; // Espaçamento entre as cercas

    const centerX = (width * fenceSpacing) / 2;
    const centerZ = (length * fenceSpacing) / 2;

    // Criar cercas para as bordas do cercado
    for (let i = 0; i < width; i++) {
        const fence1 = createFence(i * fenceSpacing - centerX, -centerZ, 0); // Linha superior
        const fence2 = createFence(i * fenceSpacing - centerX, length * fenceSpacing - centerZ, 0); // Linha inferior
        rally.add(fence1);
        rally.add(fence2);
    }

    for (let j = 0; j < length; j++) {
        const fence1 = createFence(-centerX, j * fenceSpacing - centerZ, 1); // Linha esquerda
        const fence2 = createFence(width * fenceSpacing - centerX, j * fenceSpacing - centerZ, 1); // Linha direita
        rally.add(fence1);
        rally.add(fence2);
    }

    // Adicionar a última parte vertical no canto final
    const lastVerticalPart = createVerticalPart(0.5, 3);
    lastVerticalPart.position.set(width * fenceSpacing - centerX, 1.5, length * fenceSpacing - centerZ);
    rally.add(lastVerticalPart);

    return rally;
}
