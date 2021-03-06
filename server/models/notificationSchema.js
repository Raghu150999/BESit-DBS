let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let notificationSchema = new Schema({
	targetUsername: String,
	sourceUsername: String,
	type: String,
	productID: String,
	productName: String,
	commentID: String,
	seenStatus: Boolean,
	timeStamp: Date
});

let Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;




