const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");
const jsonfilePath = path.join(__dirname, "../data", "dailyDataReadings.json");
const jsonfilePathAvg = path.join(__dirname, "../data", "averageDataWriterWorker.json");

//éffacer les daily readings et avg day readings
fs.truncate(jsonfilePath,0 ,(err)=>{
    if (err) {
        console.error('Error reading file:', err);
        parentPort.postMessage("error");
        return;
    }

    fs.truncate(jsonfilePathAvg,0 ,(err2)=>{
        if (err2) {
            console.error('Error reading file:', err2);
            parentPort.postMessage("error");
            return;
        }
    });
});