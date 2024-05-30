const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");

let dataReq = workerData;
const jsonfilePath = path.join(__dirname, "../data/actualActivateAirExchangeBool.json");
//thread pour écrire le data actuel  (actualDataReading.json)
try{
fs.readFile(jsonfilePath, 'utf8', (err1, data) => {
    if (err1) {
        console.error('Error reading file:', err1);
        parentPort.postMessage("error");
        return;
    }



    
    fs.truncate(jsonfilePath, 0, (err2) => {
        if (err2) {
            console.error('Error truncating file:', err2);
            parentPort.postMessage("error");
            return;
        }
        
        //console.log(data);
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            parentPort.postMessage("error");
            return;
        }

        // Toggle de la value
        parsedData.activate = !parsedData.activate;

        const modifiedData = JSON.stringify(parsedData, null, 2);
        //console.log(modifiedData);

        fs.writeFile(jsonfilePath, modifiedData, (err3) => {
            if (err3) {
                console.error('Error writing file:', err3);
                parentPort.postMessage("error");
                return;
            }
            parentPort.postMessage("done");
        });
    });
});
}catch(err){
    const jsonfilePath = path.join(__dirname, "../data/actualActivateAirExchangeBool.json");
    let parsedData = {activate:false};
    const modifiedData = JSON.stringify(parsedData, null, 2);
    fs.writeFile(jsonfilePath, modifiedData, (err3) => {
        if (err3) {
            console.error('Error writing file:', err3);
            parentPort.postMessage("error");
            return;
        }
        parentPort.postMessage("done");
    });
}