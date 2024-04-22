const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

<<<<<<< HEAD

=======
var con = mysql.createPool({
    host: "tp2-database-cegeplimoilou-d98e.aivencloud.com",
    port: 13923,
    user: "avnadmin",
    password: "AVNS_wB7IDMVSHeaD3M5nu0J", 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})
>>>>>>> c45523a (ajout api)

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

module.exports = router;