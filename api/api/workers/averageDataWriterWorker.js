const fs = require('fs');
const path = require("path");
const { workerData, parentPort} = require("worker_threads");

let dataReq = workerData;
//console.log(workerData);
const jsonfilePath = path.join(__dirname, "../data", "dailyDataReadings.json");

//thread pour écrire dans le average data readings  (dailyDataReadings.json)
fs.readFile(jsonfilePath, 'utf8', (err, data) => {
    try{
        if (err) {
            console.error('Error reading file:', err);
            parentPort.postMessage("error");
            return;
        }
        //console.log("run")
        const dataArray = JSON.parse(data);
        
    
        const jsonfilePathWrite = path.join(__dirname, "../data", "averageDataReadings.json");
        const averageData = calculateAverages(dataArray);
        const modifiedData = JSON.stringify(averageData, null, 2);
    
        fs.truncate(jsonfilePathWrite,0 ,(err)=>{
            if (err) {
                console.error('Error reading file:', err);
                parentPort.postMessage("error");
                return;
            }
            fs.appendFile(jsonfilePathWrite,modifiedData,(err)=>{
                if (err) {
                    console.error('Error reading file:', err);
                    parentPort.postMessage("error");
                    return;
                }
        
                    parentPort.postMessage("done");
                });
        });
    }catch(error){
        //sera rerun 
        console.log("erreur lors de calcule average (va retry automatiquement) :"+error)
    }    
});


function calculateAverages( dataArr){
    let co2 = 0;
    let voc = 0;
    let temp = 0;
    let hum = 0;
    for(let reading of dataArr){
        co2+= parseFloat( reading["co2"]);
        voc+= parseFloat( reading["voc"]);
        temp+= parseFloat( reading["temp"]);
        hum+= parseFloat( reading["humidity"]);
    }

    co2 = co2 / dataArr.length;
    voc = voc / dataArr.length;
    temp = temp / dataArr.length;
    hum = hum / dataArr.length;

    return {"co2":co2,"voc":voc,"temp":temp,"humidity":hum};
}