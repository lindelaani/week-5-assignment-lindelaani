const mysql = require('mysql2');
// const express = require('express');
// const bodyParser = require('body-parser');


// - Connection configuration
var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'B4me#2018198434',
    database: 'db'
};


//- Create the connection variable
var db = mysql.createPool(db_config);

module.exports = db;