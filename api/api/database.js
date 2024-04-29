const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const path = require("path");
const fs = require("fs");

var con = mysql.createPool({
    host: "tp2-database-cegeplimoilou-d98e.aivencloud.com",
    port: 13923,
    user: "avnadmin",
    password: "AVNS_wB7IDMVSHeaD3M5nu0J", 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

router.get("/allData",(req,res)=>{
    
    let queryForAll = "select * from Arduino.Data";
    con.query(queryForAll,(err,value)=>{
        if(err){
            console.log("Erreur bd :"+err);
            res.sendStatus(500);
            
        }

        res.send({values:value});
    });
});

function postAvgToDataBase(){
    let currentDate = new Date();
    let day = currentDate.getFullYear()+"-"+(currentDate.getUTCMonth()+1)+"-"+ currentDate.getDate() +"  "+currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();

    const jsonfilePath = path.join(__dirname, "/data", "averageDataReadings.json");
    fs.readFile(jsonfilePath, 'utf8', (err, data) => {
        try{
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
    
            let jsonData = JSON.parse(data);
            let co2 =  jsonData["co2"] ===null ?  0 : jsonData["co2"].toFixed(2);
            let humidity = jsonData["humidity"] ===null ?  0 : jsonData["humidity"].toFixed(2);
            let temp =  jsonData["temp"] ===null ?  0 : jsonData["temp"].toFixed(2);
            let voc = jsonData["voc"] ===null ?  0 : jsonData["voc"].toFixed(2);

            let query = "INSERT INTO Arduino.Data (date_heure, temperature, humidity, c02,voc) VALUES (?, ?, ?, ?, ?)";
            con.query(query,[currentDate, temp, humidity, co2, voc],(err,value)=>{
                if(err){
                    console.log("Erreur bd :"+err+"  "+day);
                }

                console.log("data inserted : "+day);
            });

        }catch(err){
            console.log("erreur insertion: "+day)
        }

    });
}

//app.post("/insertdata",(req,res)=>{

    /*let queryForAll = "insert";
    con.query(queryForAll,(err,value)=>{
        if(err){
            console.log("Erreur bd :"+err);
            res.sendStatus(500);
            
        }

        res.send({values:value});
    });*/
//});

//export le router function et la fonction de insert
module.exports = {router,postAvgToDataBase };