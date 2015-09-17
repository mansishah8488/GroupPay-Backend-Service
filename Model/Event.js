var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
	eventid : String,
	name : String,
	event_cost : Number,
	date : String,
	group : String,
	description: String
});

mongoose.model('Event', EventSchema, 'Event');