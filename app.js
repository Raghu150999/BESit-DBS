const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routers = require('./server/routes');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'besit',
  insecureAuth: true
});

connection.connect((err) => {
  if (err) {
    throw err;
  }
  else {
    console.log('Connected to DB');
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


// Route for image upload(s)
app.post('/uploaditem', (req, res) => {
  let query;
  query = "select max(_id) as lst from product";
  connection.query(query, (err, result) => {
    if (err) throw err;
    let _id = result[0].lst + 1;
    let name = req.body.name;
    let price = req.body.price;
    let status = req.body.status;
    let description = req.body.desc;
    let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let owner = req.body.owner;
    let category_name = req.body.category;
    query = "insert into product values (" + _id + ", '" + name + "', " + price + ", '" + status + "', '" + description + "', '" + timestamp + "', '" + owner + "', '" + category_name + "');";
    connection.query(query, (err, result) => {
      if (err) throw err;
      res.send('ok');
    });
  });
});


// @route: for removing item from database
app.post('/removeitem', (req, res) => {
  const item = req.body;
  let query;
  query = "delete from product where _id = " + item._id + ";";
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('ok');
  });
});

app.listen(process.env.PORT || 8000);
console.log(`Listening to port ${port}`);

module.exports.connection = connection;
