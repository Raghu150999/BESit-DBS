const router = require('express').Router();
const User = require('../models/userSchema');
const Requirement = require('../models/reqSchema');
const jwtHandler = require('./../auth/token');
const utils = require('./../utils/utils');
const jwt = require('jsonwebtoken');
const mysql=require('mysql');

var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'besit',
    insecureAuth:true
  });
  

router.post('/verifyuser', (req, res) => {
    console.log(req.body);
    User.findOne({ username: req.body.username }).then(function (result) {
        if (result)
            req.check('username', 'User already exists').not().equals(result.username);
        req.check('fname', 'First Name missing').notEmpty();
        req.check('password', 'Password cannot be empty').notEmpty();
        req.check('password', 'Passwords don\'t match').equals(req.body.rpassword);
        req.check('phoneno', 'Phoneno is invalid').isMobilePhone(["en-IN"]);
        const errors = req.validationErrors();
        let response;
        if (errors) {
            response = {
                success: false,
                errors,
            }
            res.send(response);
        }
        else {
            response = {
                success: true,
                errors: null
            }
            User.saveUser(req.body, function (result) {
                res.send(response);
            });
        }
    });
});


// @debug: Correct this route.
router.post('/updateuser', (req, res) => {
    req.check('fname', 'First Name missing').notEmpty();
    req.check('password', 'Password cannot be empty').notEmpty();
    req.check('phoneno', 'Phone number is invalid').isMobilePhone(["en-IN"]);
    let sql="update user set fname="+req.body.fname+"password="+req.body.password+"phoneno="+req.body.phoneno+"where username="+req.body.username;
    const errors = req.validationErrors();
    let response;
    if (errors) {
        response = {
            success: false,
            errors,
        }
        res.send(response);
    }
    else {
        response = {
            success: true,
            errors: null
        }
        connection.querry(sql,(err,result)=>{
            if(err)
            {
                console.log('error');
            }
            else
            {
              res.send(response);
            }
          });
    }
});

router.post('/login', (req, res) => {
    let sql="select * from user where username='"+req.body.username+"'";
    connection.query(sql, (err,result)=>{
        if(err)
        {
            console.log('error');
        }
        else
        {
            let err = false;
            let success = true;
            let cleanUser;
            if (result) {
                if (result[0].password !== req.body.password) {
                    err = true;
                    success = false;
                }
                cleanUser = utils.getCleanUser(result[0]);
            }
            else {
                err = true;
                success = false;
            }
    
            const response = {
                success: success,
                error: err,
                msg: 'Invalid username or password',
                user: cleanUser,
                token: null
            };
    
            if (err === false) {
                let token = jwtHandler.generateToken(result[0]);
                response.token = token;
            }
            res.send(response);
        }
      });
});

router.get('/authorize', (req, res) => {
    let token = req.query.token;
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) throw err;
        let sql="select * from user where username='"+user.username+"'";
        connection.query(sql,(error,result)=>{
            if(error)
            {
                console.log('error');
            }
            else
            {
                let response;
                if (result) {
                    user = utils.getCleanUser(user);
                    response = {
                        user,
                        success: true
                    }
                }
                else {
                    response = {
                        user: null,
                        success: false
                    }
                }
                res.send(response);
            }
          });
    });
});

const Product = require('./../models/productSchema');

router.get('/getInterestedUsers', (req, res) => {
    let sql="select username,status from interest where pid="+req.query.pid;
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            let response = [];
            if (result) {
                response = result
            }
            else {
                reponse = null;
            }
            res.send(response);
        }
      });
});

router.get('/getContact', (req, res) => {
    let sql="select fname,phoneno from user where username='"+req.query.username+"'";
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            let response;
            if (result) {
                response = {
                    name: result[0].fname,
                    phoneno: result[0].phoneno
                }
            }
            else {
                // @ankit pls check this block of code
                response = {
                    name: 'good',
                    phoneno: 9080683671
                }
            }
            res.send(response);
        }
      });
});

router.get('/getitems', (req, res) => {
    // req.query contains the parameter passed from axios request  // see in console your username
    console.log(req.query);
    let sql="select * from product where owner='"+req.query.username+"'";
    console.log(req.query.username);
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            let response=result;
            res.send(response);
        }
      });
});

router.get('/getprods', (req,res) => 
{
    let sql="select * from product where status='Available'";
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            result.reverse();
            res.send(result);
        }
      });
});

router.get('/getInterestedItems', (req, res) => {
    // req.query contains the parameter passed from axios request  // see in console your username
    const username=req.query.username;
    console.log(username);
    let sql="select * from interest,product where username='"+username+"' and product.pid=interest.pid";
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            res.send(result);
        }
      });
});

router.post('/updateitemstatus', (req, res) => {
    let sql="update product set status='"+req.body.status+"'where pid="+req.body.id;
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
            res.send('ok'); 
        }
      });
});

router.post('/removereq', (req, res) => {
    let sql="delete from requirement where username='"+req.body.username+"' and title='"+req.body.title+"' and desc='"+req.body.desc+"'";
    connection.query(sql,(err,result)=>{
        if(err)
        {
          console.log('error');
        }
        else
        {
          res.send('ok');
        }
      });
});

router.post('/newreq', (req,res) => 
{
    const requirement = new Requirement(
        {
            title: req.body.title,
            desc: req.body.desc,
            timestamp: req.body.timestamp,
            username: req.body.username
        });
    requirement.save().then(() => {
        res.send(requirement);
    });
});

router.get('/getreq',(req,res) =>
{
    Requirement.find().then(result =>
    {
        res.send(result.reverse());
    });
});

router.get('/getownreq',(req,res) =>
{
    Requirement.find({username: req.query.username}).then(result =>
    {
        res.send(result);
    });
});

router.post('/updateinteresteduser', (req, res) => {
    Product.findOneAndUpdate({ _id: req.body.item._id }, { interestedUsers: req.body.interestedUsers })
        .then(result => {
            res.send('ok');
        });
});

router.post('/updateitem', (req, res) => {
    Product.findOneAndUpdate({ _id: req.body.id }, { ...req.body.form }).then(result => {
        console.log(result);
        res.send('ok');
    });
});

router.post('/shareStatus', (req, res) => {
    Product.findOneAndUpdate({
        _id: req.body.item._id,
        "interestedUsers.username": req.body.username
    },
        {
            $set:
                { "interestedUsers.$.status": req.body.status }
        })
        .then(result => {
            res.send('ok');
        });
});

module.exports = router;