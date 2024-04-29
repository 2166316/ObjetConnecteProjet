const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");
const jsonfilePath = path.join(__dirname, "../data", "dailyDataReadings.json");
fs.truncate(jsonfilePath,0 ,(err)=>{
    if (err) {
        console.error('Error reading file:', err);
        parentPort.postMessage("error");
        return;
    }
});