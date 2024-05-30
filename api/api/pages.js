const {Worker , isMainThread } = require('worker_threads'); 
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();

//utiliser pour la function insertion
const { postAvgToDataBase } = require('./database');

//ne pas oublier
router.use(express.json());

//le real time worker pour savoir l'heure pas très éfficace mais bon
const timeWorker = new Worker(path.join(__dirname, "workers", "timeWorker.js"),{});
//call back pour recevoir le data du timeWorker
timeWorker.on('message', (message) => {
    if(message === "17 h 00 min 00 s"){
        console.log('heure actuel:', message +" insertion db");
        //insertion  avg
        postAvgToDataBase();
        //éffacer tous
        const worker4 = new Worker(path.join(__dirname, "workers", "deleteDataWorker.js"),{}); 
    }
});
timeWorker.on('error', (error) => {
    console.error('Worker heure error:', error);
});
timeWorker.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Worker heure arreté avec code: ${code}`);
    }
});


//retourne la vue contenant tous les valeurs
router.get('/data', (req, res) => {
    const filePath = path.join(__dirname, '../public/index.html');
    fs.readFile(filePath,'utf-8', (err1,data1)=>{
        if(err1){
            return;
        }
        
        const jsonfilePath = path.join(__dirname, './data/actualDataReading.json');
        fs.readFile(jsonfilePath, 'utf8', (err2, data2) => {
            if (err2) {
                console.error('Error reading file:', err2);
                res.status(500).send('Internal Server Error');
                return;
            }

            try{
                let test = JSON.parse(data2);
            }catch(err){
                res.status(500).send('Internal Server Error');
            }

            //data actuel
            let jsonDataRet = JSON.parse(data2);
            let co2 = jsonDataRet["co2"];
            let humidity = jsonDataRet["humidity"];
            let temp = jsonDataRet["temp"];
            let voc = jsonDataRet["voc"];

            //dernier refresh
            let currentDate = new Date();
            let day = "Last refresh: "+currentDate.getFullYear()+"-"+(currentDate.getUTCMonth()+1)+"-"+ currentDate.getDate() +"  "+currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
            jsonDataRet["date"] = day;

            const jsonfilePath = path.join(__dirname, './data/averageDataReadings.json');
            fs.readFile(jsonfilePath, 'utf8', (err3, data3) => {
                if (err3) {
                    console.error('Error reading file:', err2);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                
                //les averages   
                let jsonDataAvg = JSON.parse(data3);
                let co2Avg =  jsonDataAvg["co2avg"] === null ? jsonDataRet["co2avg"] = 0 : jsonDataRet["co2avg"] = jsonDataAvg["co2"].toFixed(2);
                let humidityAvg = jsonDataAvg["humidityavg"] === null ?  jsonDataRet["humidityavg"] = 0 : jsonDataRet["humidityavg"] = jsonDataAvg["humidity"].toFixed(2);
                let tempAvg =  jsonDataAvg["tempavg"] === null ? jsonDataRet["tempavg"] = 0 : jsonDataRet["tempavg"] =  jsonDataAvg["temp"].toFixed(2);
                let vocAvg = jsonDataAvg["vocavg"] === null ? jsonDataRet["vocavg"] = 0 : jsonDataRet["vocavg"] = jsonDataAvg["voc"].toFixed(2);


               // console.log(jsonDataRet);
                //console.log(jsonDataAvg);
                const jsonfilePath2 = path.join(__dirname, "./data/actualActivateAirExchangeBool.json");
                fs.readFile(jsonfilePath2, 'utf8', (err4, data4) => {
                    if (err4) {
                        console.error('Error reading file:', err4);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    let jsonAirExchangerData= undefined;
                    
                    try{
                        jsonAirExchangerData= JSON.parse(data4);
                        let isActiveAirExchanger = jsonAirExchangerData["activate"] === true ? jsonDataRet["color"] = "#4CAF50" : jsonDataRet["color"] = "#F44336";
                    }catch(err){
                        res.status(500).send('Internal Server Error');
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

                    

                    res.render('index', jsonDataRet );
                });
            });   
        });

    });

});


//utilisé par le uno r4 pour posté les valeurs sert de main thread
router.post('/postNewValues', (req, res) => {
    let dataReq = req.body;

    //threads s'execute sans attendre de retour se gère seul
    //thread pour update data actuel
    const worker = new Worker(path.join(__dirname, "workers", "actualDataWriterworker.js"),{workerData:dataReq});
    //thread pour mettre le conserver data actuel dans l'array
    const worker2 = new Worker(path.join(__dirname, "workers", "dailyDataWriterWorker.js"),{workerData:dataReq});
    //thread pour le data average
    const worker3 = new Worker(path.join(__dirname, "workers", "averageDataWriterWorker.js"),{workerData:dataReq});
    
    res.status(200).send('');
});

//utilisé par le uno r4 pour posté l'activation de l'échangeur d'air
router.get('/getActiveValue', (req, res) => {
    
    const jsonfilePath = path.join(__dirname, "./data/actualActivateAirExchangeBool.json");

    //thread pour écrire le data actuel  (actualDataReading.json)
    fs.readFile(jsonfilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(400);
        }
        const modifiedData = JSON.parse(data, null, 2);
        //console.log(modifiedData); //== "{\n  \"activate\": true\n}"
        res.status(200).send(modifiedData);
    });
});
//utilisé par le uno r4 pour posté l'activation de l'échangeur d'air
router.post('/postActiveValue', (req, res) => {

    //thread pour partir l'échangeur d'air
    const worker =  new Worker(path.join(__dirname, "workers", "actualAirExchangerWriter.js"),{});
    worker.addListener("message",()=>{
        //console.log("terminé")
        return res.sendStatus(200);

    });
    //return res.sendStatus(200);
});


module.exports = router;