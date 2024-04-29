const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");

let dataReq = workerData;
//console.log(workerData);
const jsonfilePath = path.join(__dirname, "../data", "actualDataReading.json");

fs.readFile(jsonfilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        parentPort.postMessage("error");
        return;
    }
    fs.truncate(jsonfilePath,0 ,(err)=>{
        if (err) {
            console.error('Error reading file:', err);
            parentPort.postMessage("error");
            return;
        }
        const modifiedData = JSON.stringify(workerData, null, 2);
        fs.appendFile(jsonfilePath,modifiedData,(err)=>{
            if (err) {
                console.error('Error reading file:', err);
                parentPort.postMessage("error");
                return;
            }

            parentPort.postMessage("done");
        });
    })

});