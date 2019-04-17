const router = require('express').Router();
const Product = require('./../models/productSchema');
const app = require('./../../app');
let con;

router.post('/', (req, res) => {
	con = app.connection;
	const data = req.body;
	const owneruser = data.user.username;
	let query;
	if (data.searchAll) {
		if (data.category === 'Any') {
			query = "select * from product where owner != '" + owneruser + "' and status = 'Available'";
			con.query(query, (err, result) => {
				if (err) throw err;
				res.send(result.reverse());
			})
		} 
		else {
			query = "select * from product where owner != '" + owneruser + "' and status = 'Available' and category_name = '" + data.category + "';";
			con.query(query, (err, result) => {
				if (err) throw err;
				res.send(result.reverse());
			});
		}
	}
	else {
		let tokens = data.searchText.split(" ");
		let str = "";
		for(let i = 0; i < tokens.length - 1; i++) {
			str += "name like '%" + tokens[i] + "%' or description like '%" + tokens[i] + "%' ";
			str += "or ";
		}
		str += "name like '%" + tokens[tokens.length - 1] + "%' or description like '%" + tokens[tokens.length - 1] + "%' ";
		query = "select * from product where owner != '" + owneruser + "' and status = 'Available' and ( " + str + ");";
		if (data.category === 'Any') {
			query = "select * from product where owner != '" + owneruser + "' and status = 'Available' and ( " + str + ");";
			con.query(query, (err, result) => {
				if (err) throw err;
				res.send(result);
			})
		}
		else {
			query = "select * from product where owner != '" + owneruser + "' and category_name = '" + data.category + "' and status = 'Available' and ( " + str + ");";
			con.query(query, (err, result) => {
				if (err) throw err;
				res.send(result);
			})
		}
	}
});


module.exports = router;