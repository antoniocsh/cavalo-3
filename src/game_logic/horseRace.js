import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

let animationFrameId;
let myHorseAccel = 1;

// Listener para barra de espaço (sempre ativo)
function handleSpaceKey(event) {
    if (event.code === 'Space') {
        if (myHorseAccel <= 1.5) {
            myHorseAccel += 0.0066;
        } else if (myHorseAccel <= 2) {
            myHorseAccel += 0.0033;
        } else {
            myHorseAccel += 0.0001;
        }
        event.preventDefault();
    }
}
window.addEventListener('keydown', handleSpaceKey);

// Listener para a tecla Q (apenas após a corrida acabar)
function handleQKey(event) {
    if (event.key.toLowerCase() === 'q') {
        const endMessage = document.querySelector('div[style*="top: 40%"]');
        if (endMessage) document.body.removeChild(endMessage);
        const returnButton = document.getElementById('returnButton');
        if (returnButton) document.body.removeChild(returnButton);

        destroyMoreSPeedButton();

        const eventLobby = new Event('raceEnded');
        window.dispatchEvent(eventLobby);

        window.removeEventListener('keydown', handleQKey);
    }
}

export async function startRace(myHorse, bot1, bot2, bot3, RACEPOSITION_X, RACEPOSITION_Z) {
    createMoreSpeedButton();
    RACEPOSITION_Z += 5;
    const end = -RACEPOSITION_Z;
    bot1.position.set(RACEPOSITION_X + 3.5, 0.2, RACEPOSITION_Z);
    myHorse.position.set(RACEPOSITION_X + 10, 0.2, RACEPOSITION_Z);
    bot2.position.set(RACEPOSITION_X + 16, 0.2, RACEPOSITION_Z);
    bot3.position.set(RACEPOSITION_X + 22.5, 0.2, RACEPOSITION_Z);

    game321Counter();
    myHorseAccel = 1;
    let myHorseVelocity = 0.1;
    let bot1velocity = 0.1;
    let bot2velocity = 0.1;
    let bot3velocity = 0.1;

    let bot1Acceleration = 1.2;
    let bot2Acceleration = 1.4;
    let bot3Acceleration = 1.1;

    await sleep(4000);

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame((time) =>
        animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, time, end)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateRace(time, myHorse, bot1, bot2, bot3, myHorseVelocity, bot1velocity, bot2velocity, bot3velocity, bot1Acceleration, bot2Acceleration, bot3Acceleration, lastTime, end) {
    const deltaTime = (time - lastTime) / 1000;

    bot1.position.z += bot1velocity * deltaTime;
    bot2.position.z += bot2velocity * deltaTime;
    bot3.position.z += bot3velocity * deltaTime;
    myHorse.position.z += myHorseVelocity * deltaTime;

    bot1velocity *= Math.pow(bot1Acceleration, deltaTime);
    bot2velocity *= Math.pow(bot2Acceleration, deltaTime);
    bot3velocity *= Math.pow(bot3Acceleration, deltaTime);
    myHorseVelocity *= Math.pow(myHorseAccel, deltaTime);

    if (bot1.position.z >= end || bot2.position.z >= end || bot3.position.z >= end || myHorse.position.z >= end) {
        let winner = '';
        if (myHorse.position.z >= end) {
            winner = 'player';
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
            document.body.removeChild(countdownElement);
        }
    }

    updateCountdown();
}

function createMoreSpeedButton() {
    const morespeedButton = document.createElement('button');
    morespeedButton.id = 'moreSpeedButton';
    morespeedButton.textContent = 'MAIS RÁPIDO (SPACE)';
    morespeedButton.style.position = 'absolute';
    morespeedButton.style.top = '10px';
    morespeedButton.style.right = '10px';
    morespeedButton.style.padding = '10px';
    morespeedButton.style.background = 'black';
    morespeedButton.style.color = 'white';
    morespeedButton.style.border = 'none';
    morespeedButton.style.borderRadius = '8px';
    morespeedButton.style.cursor = 'pointer';
    morespeedButton.onclick = () => {
        if (myHorseAccel <= 1.5) { myHorseAccel += 0.0066 }
        else if (myHorseAccel <= 2) { myHorseAccel += 0.0033 }
        else { myHorseAccel += 0.0001 }
    };
    document.body.appendChild(morespeedButton);
}

function destroyMoreSPeedButton() {
    const button = document.getElementById('moreSpeedButton');
    if (button) {
        document.body.removeChild(button);
    }
}

function endRace(winner) {
    // Mensagem de fim da corrida
    const endMessage = document.createElement('div');
    endMessage.style.position = 'absolute';
    endMessage.style.top = '40%';
    endMessage.style.left = '50%';
    endMessage.style.transform = 'translate(-50%, -50%)';
    endMessage.style.fontSize = '48px';
    endMessage.style.fontWeight = 'bold';
    endMessage.style.color = 'white';
    endMessage.style.background = 'rgba(0, 0, 0, 0.7)';
    endMessage.style.padding = '20px';
    endMessage.style.borderRadius = '10px';
    endMessage.style.textAlign = 'center';
    if (winner === 'player') {
        endMessage.textContent = '🏁 PARABÉNS! VENCESTE! 🏆';
    }
    else{endMessage.textContent = `🏁 Vencedor: ${winner}!`;}
    document.body.appendChild(endMessage);

    // Botão para voltar ao lobby
    const returnButton = document.createElement('button');
    returnButton.id = 'returnButton';
    returnButton.textContent = 'Voltar ao Lobby (Q)';
    returnButton.style.position = 'absolute';
    returnButton.style.top = '60%';
    returnButton.style.left = '50%';
    returnButton.style.transform = 'translate(-50%, -50%)';
    returnButton.style.fontSize = '24px';
    returnButton.style.padding = '10px 20px';
    returnButton.style.background = '#4CAF50';
    returnButton.style.color = 'white';
    returnButton.style.border = 'none';
    returnButton.style.borderRadius = '8px';
    returnButton.style.cursor = 'pointer';

    returnButton.onclick = () => {
        document.body.removeChild(endMessage);
        document.body.removeChild(returnButton);

        destroyMoreSPeedButton();

        const event = new Event('raceEnded');
        window.dispatchEvent(event);

        window.removeEventListener('keydown', handleQKey);
    };

    document.body.appendChild(returnButton);

    // Ativa o listener do Q só aqui, depois da corrida terminar
    window.addEventListener('keydown', handleQKey);
}
