import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

let animationFrameId; 
let myHorseAccel = 1;

const morespeedButton = document.createElement('button');
morespeedButton.textContent = 'MAIS RÁPIDO';
morespeedButton.style.position = 'absolute';
morespeedButton.style.top = '10px';
morespeedButton.style.right = '10px';
morespeedButton.style.padding = '10px';
morespeedButton.style.background = 'black';
morespeedButton.style.color = 'white';
morespeedButton.style.border = 'none';
morespeedButton.style.cursor = 'pointer';
morespeedButton.onclick = () => {
    if (myHorseAccel <= 1.5){myHorseAccel += 0.0066}
    else if (myHorseAccel <= 2) {myHorseAccel += 0.0033}
    else{myHorseAccel += 0.0001}
    
};
document.body.appendChild(morespeedButton);

export async function startRace(myHorse, bot1, bot2, bot3) {
    // Iniciar posições
    myHorse.position.set(55, 0, 5);
    bot1.position.set(60, 0, 5);
    bot2.position.set(65, 0, 5);
    bot3.position.set(70, 0, 5);

    // Contagem decrescente
    game321Counter();
    let myHorseVelocity = 0.1;
    let bot1velocity = 0.1;
    let bot2velocity = 0.1;
    let bot3velocity = 0.1;

    // Velocidade inicial dos bots
    let bot1Acceleration = 1.2;
    let bot2Acceleration = 1.4;
    let bot3Acceleration = 1.1;

    // Aguardar a contagem regressiva
    await sleep(4000);

    // Cancelar qualquer animação anterior antes de iniciar uma nova
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Inicia a animação da corrida
    animationFrameId = requestAnimationFrame((time) => 
        animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, time)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, lastTime) {
    // A cada quadro, calculamos o tempo decorrido
    const deltaTime = (time - lastTime) / 1000;  // Tempo em segundos

    // Incrementa a posição Z dos cavalos de acordo com a sua velocidade
    bot1.position.z += bot1velocity * deltaTime;
    bot2.position.z += bot2velocity * deltaTime;
    bot3.position.z += bot3velocity * deltaTime;
    myHorse.position.z += myHorseVelocity * deltaTime;
    
    // Atualiza a velocidade multiplicando pela aceleração
    bot1velocity *= Math.pow(bot1Acceleration, deltaTime);
    bot2velocity *= Math.pow(bot2Acceleration, deltaTime);
    bot3velocity *= Math.pow(bot3Acceleration, deltaTime);
    myHorseVelocity *= Math.pow(myHorseAccel, deltaTime);

    // Verifica se algum cavalo ultrapassou a linha de chegada (por exemplo, 200)
    if (bot1.position.z >= 500 || bot2.position.z >= 500 || bot3.position.z >= 500 || myHorse.position.z >= 500) {
        cancelAnimationFrame(animationFrameId); 
        console.log('Corrida terminada!');
        myHorseAccel = 1;
        return;
    }

    // Solicita o próximo quadro de animação
    animationFrameId = requestAnimationFrame((newTime) => 
        animateRace(newTime, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, time)
    );
}

function game321Counter() {
    const countdownElement = document.createElement('div');
    countdownElement.style.position = 'absolute';
    countdownElement.style.top = '50%';
    countdownElement.style.left = '50%';
    countdownElement.style.transform = 'translate(-50%, -50%)';
    countdownElement.style.fontSize = '48px';
    countdownElement.style.fontWeight = 'bold';
    countdownElement.style.color = 'white';
    countdownElement.style.background = 'rgba(0, 0, 0, 0.7)';
    countdownElement.style.padding = '20px';
    countdownElement.style.borderRadius = '10px';
    countdownElement.style.textAlign = 'center';
    document.body.appendChild(countdownElement);

    const steps = ["3", "2", "1", "START!"];
    let index = 0;

    function updateCountdown() {
        if (index < steps.length) {
            countdownElement.textContent = steps[index];
            index++;
            setTimeout(updateCountdown, 1000);
        } else {
            document.body.removeChild(countdownElement); // Remove a contagem após o "START!"
        }
    }

    updateCountdown();
}
