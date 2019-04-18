const router = require('express').Router();
const User = require('../models/userSchema');
const Requirement = require('../models/reqSchema');
const jwtHandler = require('./../auth/token');
const utils = require('./../utils/utils');
const jwt = require('jsonwebtoken');
const app = require('./../../app');

router.post('/verifyuser', (req, res) => {
    let sql = "select * from user where username = ?";
    app.connection.query(sql, req.body.username, function (err, result) {
        if (err) {
            console.log('error in 1st sql query', err);
            res.send('err during checking req.body existence');
        }
        else {
            console.log(result);
            if (result)
                req.check('username', 'User already exists').not().equals(result.username);
            req.check('fname', 'First Name missing').notEmpty();
            req.check('password', 'Password cannot be empty').notEmpty();
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
                sql = 'insert into user set ?';   //validation phoneno 10 numbers expected so use bigint(20) in database
                connection.query(sql, req.body, function (err, result) {
                    if (err) {
                        console.log(err, 'database accessing error');
                        res.send(err);
                    }
                    else {
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
    let sql = "update user set fname=" + req.body.fname + "password=" + req.body.password + "phoneno=" + req.body.phoneno + "where username=" + req.body.username;
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
        app.connection.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            else {
                res.send(response);
            }
        });
    }
});

router.post('/login', (req, res) => {
    let sql = "select * from user where username='" + req.body.username + "'";
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
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
        let sql = "select * from user where username='" + user.username + "'";
        app.connection.query(sql, (error, result) => {
            if (error) {
                throw err;
            }
            else {
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


router.get('/getInterestedUsers', (req, res) => {
    let sql = "select username,status from interest where _id=" + req.query._id;
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
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
    let sql = "select fname,phoneno from user where username='" + req.query.username + "'";
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            let response;
            if (result) {
                response = {
                    name: result[0].fname,
                    phoneno: result[0].phoneno
                }
            }
            else {
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
    let sql = "select * from product where owner='" + req.query.username + "';";
    app.connection.query(sql, (err, result) => {
        let items;
        if (err) {
            throw err;
        }
        else {
            items = [];
            let flag = false;
            for (let i = 0; i < result.length; i++) {
                flag = true;
                query = "select * from interest where _id = " + result[i]._id + ";";
                let item = result[i];
                item.category = item.category_name;
                let interestedUsers = [];
                app.connection.query(query, (err, result2) => {
                    if (err) throw err;
                    for (let j = 0; j < result2.length; j++) {
                        interestedUsers.push({
                            username: result2[j].username,
                            status: result2[j].contactDisplay
                        });
                    }
                    item.interestedUsers = interestedUsers;
                    items.push(item);
                    if (i == (result.length - 1)) {
                        res.send(items);
                    }
                });
            }
            if (!flag)
                res.send(result);
        }
    });
});

router.get('/getprods', (req, res) => {
    let sql = "select * from product where status='Available'";
    app.connection.query(sql, (err, result) => {
        let items = [];
        if (err) {
            throw err;
        }
        else {
            items = [];
            let flag = false;
            for (let i = 0; i < result.length; i++) {
                flag = true;
                query = "select * from interest where _id = " + result[i]._id + ";";
                let item = result[i];
                item.category = item.category_name;
                let interestedUsers = [];
                app.connection.query(query, (err, result2) => {
                    if (err) throw err;
                    for (let j = 0; j < result2.length; j++) {
                        interestedUsers.push({
                            username: result2[j].username,
                            status: result2[j].contactDisplay
                        });
                    }
                    item.interestedUsers = interestedUsers;
                    items.push(item);
                    if (i == (result.length - 1)) {
                        res.send(items);
                    }
                });
            }
            if (!flag)
                res.send(result);
        }
    });
});

router.get('/getInterestedItems', (req, res) => {
    const username = req.query.username;
    let sql = "select * from interest,product where username='" + username + "' and product._id=interest._id";
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            for (let i = 0; i < result.length; i++) {
                result[i].category = result[i].category_name;
                result[i].status = result[i].contactDisplay;
            }
            res.send(result);
        }
    });
});

router.post('/updateitemstatus', (req, res) => {
    let sql = "update product set status='" + req.body.status + "'where _id=" + req.body.id;
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            res.send('ok');
        }
    });
});

router.post('/removereq', (req, res) => {
    let sql = "delete from requirement where username='" + req.body.username + "' and title='" + req.body.title + "' and desc='" + req.body.desc + "'";
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            res.send('ok');
        }
    });
});

router.post('/newreq', (req, res) => {
    let sql = "insert into requirement set ?";
    app.connection.query(sql, req.body, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            res.send('ok');
        }
    });
});

router.get('/getreq', (req, res) => {
    let sql = "select * from requirement order by timestamp desc";
    app.connection.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            res.send(result);
        }
    });
});

router.get('/getownreq', (req, res) => {
    let sql = "select * from requirement where username = ?";
    app.connection.query(sql, req.query.username, (err, result) => {
        if (err) {
            throw err;
        }
        else {
            res.send(result);
        }
    });
});

router.post('/updateinteresteduser', (req, res) => {
    let query = "delete from interest where _id = " + req.body.item._id + ";";
    let interestedUsers = req.body.interestedUsers;

    for (let i = 0; i < interestedUsers.length; i++) {
        query = "insert into interest values ('" + interestedUsers[i].username + "', " + req.body.item._id + ", " + interestedUsers[i].status + ");";
        app.connection.query(query, (err, result) => {
            if (err) throw err;
        });
    }
    res.send('ok');
});

router.post('/updateitem', (req, res) => {
    let query = "update product set ? where _id = " + req.body._id + ";";
    app.connection.query(query, req.body, (err, result) => {
        if (err) throw err;
        res.send('ok');
    });
});

router.post('/shareStatus', (req, res) => {
    let query = "update interest set contactDisplay = " + req.body.status + " where _id = " + req.body.item._id + " and username = '" + req.body.username + "';";
    app.connection.query(query, (err, result) => {
        if (err) throw err;
        res.send('ok');
    });
});

module.exports = router;