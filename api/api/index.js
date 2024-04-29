const express = require("express");
const path = require("path");
var app = express();

const dbRoutes = require("./database");
const pagesRoutes = require("./pages");
const arduinoRoutes = require("./arduinoEndPoint");

//serve le dossier public
app.use(express.static(path.join(__dirname, '../public')));

//les routes
app.use("/", pagesRoutes);
app.use("/db", dbRoutes);
//app.use("/ar", arduinoRoutes);

//le port 
app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
