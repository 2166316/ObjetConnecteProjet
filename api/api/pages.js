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
const isReadyReset = true;

router.set

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
    
    let currentDate = new Date();
    let heure  = currentDate.getHours();

    //reset la condition du reset
    if(heure > 23){
        isReadyReset = true;
    }
    
    if(heure === 0 && isReadyReset){
        isReadyReset = false;
        //execute le reset de la journée
        const worker4 = new Worker(path.join(__dirname, "workers", "deleteDataWorker.js"),{workerData:dataReq});
        //insertion 
        postAvgToDataBase();
    }
    //
    else{
        //threads
        //thread pour update data actuel
        const worker = new Worker(path.join(__dirname, "workers", "actualDataWriterworker.js"),{workerData:dataReq});
        //thread pour mettre le conserver data actuel dans l'array
        const worker2 = new Worker(path.join(__dirname, "workers", "dailyDataWriterWorker.js"),{workerData:dataReq});
        //thread pour le data average
        const worker3 = new Worker(path.join(__dirname, "workers", "averageDataWriterWorker.js"),{workerData:dataReq});
        //thread pour écrire les données actuel
        worker.on("message", (data)=>{
            if (data === "done") {
                res.sendStatus(200);
            } else if (data === "error") {
                res.status(500).send('Internal Server Error');
            }
        });
        worker2.on("error", (error)=>{
            console.log(error);
            res.status(500).send('Internal Server Error');
        }); 
    }  
});

module.exports = router;