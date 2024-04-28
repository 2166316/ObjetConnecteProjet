const express = require("express");
const path = require("path");
var app = express();

const dbRoutes = require("./database");
const pagesRoutes = require("./pages");

//serve public folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount route files
app.use("/", pagesRoutes);
app.use("/db", dbRoutes);

app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
