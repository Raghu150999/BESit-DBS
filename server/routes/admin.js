const router = require('express').Router();
const Category = require('./../models/categoySchema');
const app = require('./../../app');

router.post('/addcategory', (req, res) => {
	let query = "insert into category values ('" + req.body.name + "');";
	app.connection.query(query, (err, result) => {
		if (err) throw err;
		res.send('added category');
	})
});

router.get('/getcategories', (req, res) => {
	let query = "select * from category";
	app.connection.query(query, (err, result) => {
		if (err) throw err;
		res.send(result);
	})
});

module.exports = router;