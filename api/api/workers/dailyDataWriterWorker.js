const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");

let dataReq = workerData;
const jsonfilePath = path.join(__dirname, "../data", "dailyDataReadings.json");

//thread pour écrire dans l'array des daily readings (dailyDataReadings.json)
fs.readFile(jsonfilePath, 'utf8', (err, data) => {
    try{
        if (err) {
            console.error('Error reading file:', err);
            parentPort.postMessage("error");
            return;
        }
        let currentDate = new Date();
        const dataArray = JSON.parse(data);
        dataReq["heure"] = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
        dataArray.push(dataReq);
        const modifiedData = JSON.stringify(dataArray, null, 2);

        fs.truncate(jsonfilePath,0 ,(err)=>{
            if (err) {
                console.error('Error reading file:', err);
                parentPort.postMessage("error");
                return;
            }
            fs.appendFile(jsonfilePath,modifiedData,(err)=>{
                if (err) {
                    console.error('Error reading file:', err);
                    parentPort.postMessage("error");
                    return;
                }   
                    parentPort.postMessage("done");
                });
        });
    }catch(error){
        console.log("erreur lors de l'écriture de dans l'array daily:"+error)
        //corrige l'erreur si data array indisponible
        const jsonfilePath = path.join(__dirname, "../data", "dailyDataReadings.json");
        fs.truncate(jsonfilePath,0 ,(err)=>{
            if (err) {
                console.error('Error reading file:', err);
                parentPort.postMessage("error");
                return;
            }
            fs.appendFile(jsonfilePath,JSON.stringify([], null, 2),(err)=>{
                if (err) {
                    console.error('Error reading file:', err);
                    parentPort.postMessage("error");
                    return;
                }
                    parentPort.postMessage("done");
                });
        });
        
    }    
});
