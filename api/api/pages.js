const {Worker} = require('worker_threads'); 
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();

//ne pas oublier
router.use(express.json());

//router.use(bodyParser.urlencoded({ extended: false }));

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

            let jsonData = JSON.parse(data2);
            let co2 = jsonData["co2"];
            let humidity = jsonData["humidity"];
            let temp = jsonData["temp"];
            let voc = jsonData["voc"];

            //dernier refresh
            let currentDate = new Date();
            let day = "Last refresh: "+currentDate.getFullYear()+"-"+(currentDate.getUTCMonth()+1)+"-"+ currentDate.getDate() +"  "+currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();

            //modifie hmtl
            let htmlmodifie = data1.replace("<!--date-->",day);
            //les valeurs de actuelles
            htmlmodifie = htmlmodifie.replace("<!--hum-->",humidity);
            htmlmodifie = htmlmodifie.replace("<!--co2-->",co2);
            htmlmodifie = htmlmodifie.replace("<!--temp-->",temp);
            htmlmodifie = htmlmodifie.replace("<!--voc-->",voc);

            const jsonfilePath = path.join(__dirname, './data/averageDataReadings.json');
            fs.readFile(jsonfilePath, 'utf8', (err2, data3) => {
                if (err2) {
                    console.error('Error reading file:', err2);
                    res.status(500).send('Internal Server Error');
                    return;
                }
        
                let jsonData = JSON.parse(data3);
                let co2 =  jsonData["voc"] ===null ?  0 : jsonData["co2"].toFixed(2);
                let humidity = jsonData["voc"] ===null ?  0 : jsonData["humidity"].toFixed(2);
                let temp =  jsonData["voc"] ===null ?  0 : jsonData["temp"].toFixed(2);
                let voc = jsonData["voc"] ===null ?  0 : jsonData["voc"].toFixed(2);

                //les averages             
                htmlmodifie = htmlmodifie.replace("<!--avghum-->",humidity);
                htmlmodifie = htmlmodifie.replace("<!--avgco2-->",co2);
                htmlmodifie = htmlmodifie.replace("<!--avgtemp-->",temp);
                htmlmodifie = htmlmodifie.replace("<!--avgvoc-->",voc);
                res.send(htmlmodifie);           
            });   
        });

    });

});


//utilisé par le uno r4 pour posté les valeurs 
router.post('/postNewValues', (req, res) => {
    let dataReq = req.body;
    //console.log(dataReq)

    //run chacun
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
});

module.exports = router;