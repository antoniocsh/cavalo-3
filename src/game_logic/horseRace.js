import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

let animationFrameId; 
let myHorseAccel = 1;

export async function startRace(myHorse, bot1, bot2, bot3, RACEPOSITION_X, RACEPOSITION_Z) {
    // Iniciar posições
    createMoreSpeedButton();
    RACEPOSITION_Z +=5;
    const end = -RACEPOSITION_Z;
    bot1.position.set(RACEPOSITION_X+5, 0.2, RACEPOSITION_Z);
    myHorse.position.set(RACEPOSITION_X+10, 0.2, RACEPOSITION_Z);
    bot2.position.set(RACEPOSITION_X+15, 0.2, RACEPOSITION_Z);
    bot3.position.set(RACEPOSITION_X+20, 0.2, RACEPOSITION_Z);

    // Contagem decrescente
    game321Counter();
    myHorseAccel = 1
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
        animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, time, end)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, lastTime, end) {
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
    if (bot1.position.z >= end || bot2.position.z >= end || bot3.position.z >= end || myHorse.position.z >= end) {
        let winner = '';
        if (myHorse.position.z >= end) {
            winner = 'Você';
        } else if (bot1.position.z >= end) {
            winner = 'Bot 1';
        } else if (bot2.position.z >= end) {
            winner = 'Bot 2';
        } else if (bot3.position.z >= end) {
            winner = 'Bot 3';
        }
        cancelAnimationFrame(animationFrameId); 
        console.log('Corrida terminada!');
        myHorseAccel = 1;
        destroyMoreSPeedButton();
        endRace(winner);
        return;
    }

    // Solicita o próximo quadro de animação
    animationFrameId = requestAnimationFrame((newTime) => 
        animateRace(newTime, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, time, end)
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

function createMoreSpeedButton() {
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
}


function destroyMoreSPeedButton(){
    const button = document.querySelector('button');
    if (button) {
        document.body.removeChild(button);
    }
}

function endRace(winner) {
    const endMessage = document.createElement('div');
    endMessage.style.position = 'absolute';
    endMessage.style.top = '50%';
    endMessage.style.left = '50%';
    endMessage.style.transform = 'translate(-50%, -50%)';
    endMessage.style.fontSize = '48px';
    endMessage.style.fontWeight = 'bold';
    endMessage.style.color = 'white';
    endMessage.style.background = 'rgba(0, 0, 0, 0.7)';
    endMessage.style.padding = '20px';
    endMessage.style.borderRadius = '10px';
    endMessage.style.textAlign = 'center';
    endMessage.textContent = `O vencedor é: ${winner}!`;
    document.body.appendChild(endMessage);
    // Adicione um botão para voltar para o inicio
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Voltar para o início';
    restartButton.style.position = 'absolute';
    restartButton.style.top = '60%';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.padding = '10px';
    restartButton.style.background = 'black';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
        document.body.removeChild(endMessage);
        document.body.removeChild(restartButton);
        window.location.reload(); // Simplesmente recarrega a página para reiniciar o jogo
        
    };
    document.body.appendChild(restartButton);
}
