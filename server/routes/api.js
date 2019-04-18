const router = require('express').Router(); //or can we import express only and use it for routes
const User = require('../models/userSchema');
const Requirement = require('../models/reqSchema');
const jwtHandler = require('./../auth/token');
const utils = require('./../utils/utils');
const jwt = require('jsonwebtoken');
const app=require('./../../app');
var connection; //taking whole exports object as app and then using app.connection but why not working ????


router.post('/verifyuser', (req, res) => {
    connection= app.connection;
    let sql="select * from user where username = ?";
    connection.query(sql,req.body.username,function (err,result) {
        if(err){
            console.log('error in 1st sql query',err);
            res.send('err during checking req.body existence');
        }
        else{
            console.log(result);
            if (result)
                req.check('username', 'User already exists').not().equals(result.username);
            req.check('fname', 'First Name missing').notEmpty();
            req.check('password', 'Password cannot be empty').notEmpty();
            //req.check('password', 'Passwords don\'t match').equals(req.body.rpassword);
            req.check('phoneno', 'Phoneno is invalid').isMobilePhone(["en-IN"]);
            const errors = req.validationErrors();
            let response;
            if (errors) {
                response = {
                    success: false,
                    errors,
                }
                console.log(errors);
                res.send(response);
            }
            else {
                response = {
                    success: true,
                    errors: null
                }
                sql='insert into user set ?';   //validation phoneno 10 numbers expected so use bigint(20) in database
                connection.query(sql,req.body, function(err,result){
                    if(err){
                        console.log(err,'database accessing error');
                        res.send(err);
                    }
                    else{
                        console.log(result);
                        res.send(response);
                    }
                });
            }
        }
    });
});


// @debug: Correct this route.
router.post('/updateuser', (req, res) => {
    req.check('fname', 'First Name missing').notEmpty();
    req.check('password', 'Password cannot be empty').notEmpty();
    req.check('phoneno', 'Phone number is invalid').isMobilePhone(["en-IN"]);
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
        User.findOneAndUpdate({ username: req.body.username }, { fname: req.body.fname, password: req.body.password, phoneno: req.body.phoneno }).then(function (result) {
            res.send(response);
        });
    }
});

router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }).then(result => {
        let err = false;
        let success = true;
        let cleanUser;
        if (result) {
            if (result.password !== req.body.password) {
                err = true;
                success = false;
            }
            cleanUser = utils.getCleanUser(result);
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
            let token = jwtHandler.generateToken(result);
            response.token = token;
        }
        res.send(response);
    });
});

router.get('/authorize', (req, res) => {
    let token = req.query.token;
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) throw err;
        User.findOne({ username: user.username }).then(result => {
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
            res.json(response);
        });
    });
});

const Product = require('./../models/productSchema');

router.get('/getInterestedUsers', (req, res) => {
    Product.findOne({ _id: req.query.id }).then(result => {
        let response = [];
        if (result) {
            response = result.interestedUsers
        }
        else {
            reponse = null;
        }
        console.log(response);
        res.send(response);
        
    });
});

router.get('/getContact', (req, res) => {
    User.findOne({ username: req.query.username }).then(result => {
        let response;
        if (result) {
            response = {
                name: result.fname,
                phoneno: result.phoneno
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
    });
});

router.get('/getitems', (req, res) => {
    // req.query contains the parameter passed from axios request  // see in console your username
    Product.find({ owner: req.query.username }).then(result => {
        res.send(result);
    });
});

router.get('/getprods', (req,res) => 
{
    Product.find({status: 'Available'}).then(result =>
    {
        result.reverse();
        res.send(result);
    })
});

router.get('/getInterestedItems', (req, res) => {
    // req.query contains the parameter passed from axios request  // see in console your username
    const username=req.query.username;
    console.log(username);
    Product.find({'interestedUsers.username':username}).then(result => {
        res.send(result);
    });
});

router.post('/updateitemstatus', (req, res) => {
    Product.findOneAndUpdate({ _id: req.body.id }, { status: req.body.status }).then(result => {
        res.send('ok');
    });
});

router.post('/removereq', (req, res) => {
    console.log(req.body._id);
    Requirement.deleteOne({ _id: req.body._id}).then(result => {
        res.send('ok');
    });
});

router.post('/newreq', (req,res) => 
{   connection=app.connection;
    // const requirement = new Requirement(
    //     {
    //         title: req.body.title,
    //         desc: req.body.desc,
    //         timestamp: req.body.timestamp,
    //         username: req.body.username
    //     });
    // requirement.save().then(() => {
    //     res.send(requirement);
    // });
    let sql="insert into requirement set ?";
    console.log(req.body);
    connection.query(sql,req.body,(err,result)=>{
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            console.log('inserted into database',result);
            res.send(result);
        }
    });
    //res.send({req:req.body});
});

router.get('/getreq',(req,res) =>
{
    // Requirement.find().then(result =>
    // {
    //     res.send(result.reverse());
    // });
    connection=app.connection;
    let sql="select * from requirement order by timestamp desc";
    connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            console.log(result);
            res.send(result);
        }
    });
});

router.get('/getownreq',(req,res) =>
{
    // Requirement.find({username: req.query.username}).then(result =>
    // {
    //     res.send(result);
    // });
    connection=app.connection;
    let sql="select * from requirement where username= ?";
    console.log(req.query);
    console.log(req.body);
    connection.query(sql,req.query.username,(err,result)=>{
        if(err){
            console.log(err);
            res.send(err);
        }
        else {
            //console.log(result);
            res.send(result);
        }
    });
});

router.post('/updateinteresteduser', (req, res) => {
    connection=app.connection;
    let sql="insert into interest set ?";
    // Product.findOneAndUpdate({ _id: req.body.item._id }, { interestedUsers: req.body.interestedUsers })
    //     .then(result => {
    //         res.send('ok');
    //     });
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