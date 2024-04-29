const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const router = express.Router();

//ne pas oublier
router.use(express.json());

router.use(bodyParser.urlencoded({ extended: false }));


/*router.post("/postData", (req, res) => {
});*/

module.exports = router;