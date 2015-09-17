var mongoose = require('mongoose');

var JoinSchema = new mongoose.Schema({
	notificationid: Number,
	user: {type: mongoose.Schema.Type.ObjectId, ref: 'User'},
	admin: {type: mongoose.Schema.Type.ObjectId, ref: 'User'},
	group: {type: mongoose.Schema.Type.ObjectId, ref: 'Group'},
	is_accepted: {type: Boolean, default: false}
});

mongoose.model('Join', JoinSchema, 'Join');
