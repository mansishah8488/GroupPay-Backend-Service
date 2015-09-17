var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	name : String,
	groupid: String,
	created_at : String,
	admin : String, 
	moneypool : {type : Number, default : 0},
	frequency : Number,
	frequency_type : String,
	frequency_amount : Number,
	users : [{type: String}],
	events : [{type: String}]
});


mongoose.model('Group', GroupSchema, 'Group');