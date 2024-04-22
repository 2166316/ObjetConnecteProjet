const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const PORT = 5000;

app.get("/api/test",(req,res)=>{
    console.log("Accessed by: "+req.ip);
    res.send("test").end();
});

app.post("/api/co2",(req,res)=>{
    console.log("");
    console.log("Accessed by: "+req.ip);
   // console.log(req.body);
    let c02val = req.body.co2;
    console.log("C02 value: "+c02val);
    res.send("received C02: "+c02val).end();
});


app.listen(PORT,()=>{
    console.log("Api listening on port : "+PORT);
});