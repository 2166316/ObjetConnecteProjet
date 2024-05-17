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
    if(message === "23 h 00 min 00 s"){
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


                res.render('index', jsonDataRet );
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

module.exports = router;