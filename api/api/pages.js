const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();

//ne pas oublier
router.use(express.json());

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/test', (req, res) => {
    const filePath = path.join(__dirname, '../public/index.html');
    fs.readFile(filePath,'utf-8', (err1,data1)=>{
        if(err1){
            return;
        }
        
        const jsonfilePath = path.join(__dirname, 'data.json');
        fs.readFile(jsonfilePath, 'utf8', (err2, data2) => {
            if (err2) {
                console.error('Error reading file:', err2);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // Parse the JSON data into an object
            let jsonData = JSON.parse(data2);
            let co2 = jsonData["co2"];
            let humidity = jsonData["humidity"];
            let temp = jsonData["temp"];

            //date
            let currentDate = new Date();
            let day = currentDate.getFullYear()+"-"+(currentDate.getUTCMonth()+1)+"-"+ currentDate.getDate();

            //modifie hmtl
            let htmlmodifie = data1.replace("<!--date-->",day);
            htmlmodifie = htmlmodifie.replace("<!--hum-->",humidity);
            htmlmodifie = htmlmodifie.replace("<!--co2-->",co2);
            htmlmodifie = htmlmodifie.replace("<!--temp-->",temp);
            res.send(htmlmodifie);
        
        });

    });

});


router.post('/postNewValues', (req, res) => {
    
    let dataReq = req.body;
    const jsonfilePath = path.join(__dirname, 'data.json');
    fs.readFile(jsonfilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        
        // Parse the JSON data into an object
        let jsonData = JSON.parse(data);

        jsonData["co2"] = dataReq["co2"];
        jsonData["temp"] = dataReq["temp"];
        jsonData["humidity"] = dataReq["humidity"];

        const modifiedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(jsonfilePath,modifiedData,(err)=>{
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.sendStatus(200);
        });
        //res.sendStatus(500);
    
    });
});

module.exports = router;