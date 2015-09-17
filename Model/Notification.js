var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
	notificationid: String,
	userid: String,
	adminid: String,
	groupid: String,
	user: String,
	group: String,
	is_accepted: {type: Boolean, default: false},
	is_replied: {type: Boolean, default: false}
});

mongoose.model('Notification', NotificationSchema, 'Notification');
