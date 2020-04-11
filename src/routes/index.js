//Requires ========================
const express = require('express');


const routerExpress = express.Router();

routerExpress.get('/', (req, res) => {
    res.send('Ready');
});

module.exports = routerExpress;