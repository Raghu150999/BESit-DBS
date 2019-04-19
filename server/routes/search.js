const router = require('express').Router();
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
				let items = [];
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
							res.send(items.reverse());
						}
					});
				}
				if (!flag)
					res.send(result);
			})
		} 
		else {
			query = "select * from product where owner != '" + owneruser + "' and status = 'Available' and category_name = '" + data.category + "';";
			con.query(query, (err, result) => {
				if (err) throw err;
				let items = [];
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
							res.send(items.reverse());
						}
					});
				}
				if (!flag)
					res.send(result);
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
				let items = [];
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
			})
		}
		else {
			query = "select * from product where owner != '" + owneruser + "' and category_name = '" + data.category + "' and status = 'Available' and ( " + str + ");";
			con.query(query, (err, result) => {
				if (err) throw err;
				let items = [];
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
			});
		}
	}
});


module.exports = router;