const { parentPort } = require('worker_threads');

//thread de temp retourne le le temp actuel à chaque 500 ms
function sendCurrentTime() {
    const currentTime = new Date().toLocaleTimeString();
    parentPort.postMessage(currentTime);
}

setInterval(sendCurrentTime, 500);