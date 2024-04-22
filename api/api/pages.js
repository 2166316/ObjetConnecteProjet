const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
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
    
            let nb = jsonData["nb"];
            let htmlmodifie = data1.replace("<!--test-->",nb);
            res.send(htmlmodifie);
        
        });

    });

});


router.get('/nbinc', (req, res) => {
    const jsonfilePath = path.join(__dirname, 'data.json');
    fs.readFile(jsonfilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Parse the JSON data into an object
        let jsonData = JSON.parse(data);

        jsonData["nb"] = jsonData["nb"] + 1;

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