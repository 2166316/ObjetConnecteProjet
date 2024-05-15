const { parentPort } = require('worker_threads');

//thread de temp
function sendCurrentTime() {
    const currentTime = new Date().toLocaleTimeString();
    parentPort.postMessage(currentTime);
}

setInterval(sendCurrentTime, 500);