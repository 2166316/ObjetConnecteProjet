const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");

let dataReq = workerData;
const jsonfilePath = path.join(__dirname, "../data", "actualDataReading.json");

//thread pour écrire le data actuel  (actualDataReading.json)
fs.readFile(jsonfilePath, 'utf8', (err1, data) => {
    if (err1) {
        console.error('Error reading file:', err1);
        parentPort.postMessage("error");
        return;
    }
    fs.truncate(jsonfilePath,0 ,(err2)=>{
        if (err2) {
            console.error('Error reading file:', err2);
            parentPort.postMessage("error");
            return;
        }
        const modifiedData = JSON.stringify(workerData, null, 2);
        fs.appendFile(jsonfilePath,modifiedData,(err3)=>{
            if (err3) {
                console.error('Error reading file:', err3);
                parentPort.postMessage("error");
                return;
            }

            parentPort.postMessage("done");
        });
    })

});