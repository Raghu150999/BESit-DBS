const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routers = require('./server/routes');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Product = require('./server/models/productSchema');

const app = express();
const mysql=require('mysql');
const connection=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'root',
  database:'besit',
  insecureAuth:true
});
connection.connect((err)=>{
  if(err){
    console.log(err);
  }
  else{
    console.log('database conected');
  }
});
// environment variables for jwt token
require('dotenv').config();


// Middleware Setup
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routers);

// Custom middleware to handle errors
app.use((err, req, res, next) => {
  console.log('Error:', err.message);
  res.status(422).json(err.message);
});

const port = process.env.NODE_ENV ? process.env.PORT : 8000;


app.listen(process.env.PORT || 8000);
console.log(`Listening to port ${port}`);
module.exports.connection = connection;