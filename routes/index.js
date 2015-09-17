var express = require('express');
var router = express.Router();
var Q = require('q');
var mongoose = require('mongoose');

var UserSchema = mongoose.model('User');
var GroupSchema = mongoose.model('Group');
var EventSchema = mongoose.model('Event');
var PaymentSchema = mongoose.model('Payment');
var NotificationSchema = mongoose.model('Notification');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Express' });
});

//Common response method for all the responses
function respondData(res, data){
	res.json({
		type: true,
		data: data
	});

}

//Login, to get all the user details
router.post('/user/login', function(req, res){
	UserSchema.findOne({userid:req.body.userid}, function(err, user){
		if(err) {
			console.log(err);
		}
		else{
			//if exists
			if(user){
				respondData(res, user);
			}
			//if does not exist
			else{
				var newUser = new UserSchema();
				console.log(req.body.userid);
				newUser.userid = req.body.userid;
				newUser.name = req.body.name;
				newUser.URL = req.body.URL;
				newUser.groups = [];
				newUser.events = [];
				newUser.payments = [];
				newUser.notifications = [];

				newUser.save(function(err, user){
					if(err){
						console.log(err);
					}
					else{
						user.save(function(err, user){
							if(err){
								console.log(err);
							}
							else{
								respondData(res, user);
							}
						});
					}
				});
			}
		}
	});
});
/*********************************************** USER REQUEST START*************************************/
//to request the admin of a particular group to join this group
router.post('/user/:userid/group/:groupid/join', function(req, res){
	findUser(req.params.userid).then(function(user){
		findGroup(req.params.groupid).then(function(group){
			var ownerid = group.admin;
			findUser(ownerid).then(function(user){
				user.notify.push();
			}).fail();
		}).fail(function(err){
			console.log(err);
		});	
	}).fail(function(err){
		console.log(err);
	});
});

//to register out from a particular group
router.get('/user/:userid/group/:groupid/getout', function(req, res){

});
/*********************************************** USER REQUEST END*************************************/


/*********************************************** GROUP START*************************************/
//To create a group with this user as the admin
router.post('/user/:userid/groups', function(req, res){
	
	findUser(req.params.userid).then(function(user){
		var newGroup = new GroupSchema();
		
		newGroup.name = req.body.name;
		newGroup.created_at = req.body.created_at;
		newGroup.admin = req.params.userid;
		newGroup.frequency = req.body.frequency;
		newGroup.frequency_type = req.body.frequency_type;
		newGroup.frequency_amount = req.body.frequency_amount;
		newGroup.users = [];
		newGroup.events = [];
		newGroup.save(function(err, group){

			if(err){
	
				console.log(err);
			}
			else{
				if(group){
					console.log("gg3:" + group._id);
					group.groupid = group._id;
					group.save(function(err, group){});
					UserSchema.update({userid : user.userid}, {$push : {groups: group._id}}, function(err, user){
						if(err){
				
							console.log(err);
						}
						else{
							if(user){
								respondData(res, group);
							}
						}
					});
				}
			}
		});
	}).fail(function(err){
		console.log(err);
	});
});

//to get all the groups of this user
router.get('/user/:userid/groups', function(req, res){

	findUser(req.params.userid).then(function(user){
		console.log(user.groups);
		GroupSchema.find({groupid : {$in : user.groups}}, function(err, groups){
			if(err){
				console.log(err)
			}
			else{
				
				respondData(res, groups);
			}
		});

	}).fail(function(err){
		console.log(err)
	});

});

//to get all the details of a particular group
router.get('/user/:userid/group/:groupid', function(req, res){

	UserSchema.findOne({userid : req.params.userid}, function(err, user){
		if(err){
			console.log(err);
		}
		else{
			if(user){
				findGroup(req.params.groupid).then(function(group){
					respondData(group);
				}).fail(function(err){
					console.log(err);
				});
			}
			else{
				//ERROR
			}
		}
	});
});

//To find all the groups that this user is not joined in
router.get('/user/:userid/allgroup', function(req, res){
	console.log('lol1');
	findUser(req.params.userid).then(function(user){
		GroupSchema.find({ $and: [ { groupid: { $nin: user.groups } }, { admin: { $nin: user.groups } } ] }, function(err, groups){
			if(err){
				console.log(err);
			}
			else{
				respondData(res, groups);
			}
		});
	}).fail(function(err){
		console.log(err);
	});

});

//A join request by the user
router.post('/user/:userid/join/:groupid', function(req, res){
	var userid = req.params.userid;
	var groupid = req.params.groupid;
	var username = req.body.name;
	
	findGroup(groupid).then(function(group){
		var admin = group.admin;
		var newNotification = new NotificationSchema();
		newNotification.userid = userid;
		newNotification.adminid = admin;
		newNotification.groupid = groupid;
		newNotification.user = username;
		newNotification.group = group.name;
		newNotification.is_accepted = false;
		
		newNotification.save(function(err, notification){
			if(err){
				console.log(err);
			}
			else{
				notification.notificationid = notification._id;
				notification.save(function(err, notification){
					if(err){
						console.log(err);
					}
					else{
						respondData(res, notification);
					}
				});
			}
		});
			
	}).fail(function(err){
		console.log(err);
	});
	
});

router.get('/admin/:adminid/requests', function(req, res){
	
	NotificationSchema.find({ $and: [ { admin : req.params.adminid }, { is_replied : true } ] }, function(err, notifications){
		if(err){
			console.log(err);
		}
		else{
			respondData(res, notifications);
		}
	});
});

router.post('/request/:requestid', function(req, res){
	var response = req.body.response;
	NotificationSchema.findOne({notificationid : req.params.requestid}, function(err, notification){
		notification.is_accepted = response;
		notification.is_replied = true;
		notification.save(function(err, notification){});
		if(response){
			findUser(notification.userid).then(function(user){
				user.groups.push(notification.groupid);
				user.save(function(err, user){
					if(err){
						console.log(err);
					}
					else{
						
					}
				});
			}).fail(function(err){
				console.log(err);
			});
			
			findGroup(notification.groupid).then(function(group){
				group.users.push(notification.userid);
				group.save(function(err, group){
					if(err){
						console.log(err);
					}
					else{
						respondData(res, group);
					}
				});
			}).fail(function(err){
				console.log(err);
			});
		}
		
	});
});
/*********************************************** GROUP END*************************************/


/*********************************************** EVENTS START*************************************/
//to create events inside a particular group
router.post('/user/:userid/group/:groupid/events', function(req, res){
	findUser(req.params.userid).then(function(user){
		findGroup(req.params.groupid).then(function(group){

			var newEvent = new EventSchema();
			newEvent.name = req.body.name;
			newEvent.event_cost = req.body.event_cost;
			newEvent.created_at = req.body.created_at;
			newEvent.group = req.body.groupid;
			newEvent.description = req.body.description;
			newEvent.save(function(err, event){
				if(err){
					console.log(err);
				}
				else{
					if(event){
						event.eventid = event._id;
						event.save(function(err, event){
							if(err){
								console.log(err);
							}
							else{
								respondData(event);
							}
						});
						
					}
					else{
						//ERROR
					}
				}
			});

		}).fail(function(err){
			console.log(err);
		});

	}).fail(function(err){
		console.log(err);
	});
});

//To get all the events inside a particular group
router.get('/user/:userid/group/:groupid/events', function(req, res){
	findUser(req.params.userid).then(function(user){
		findGroup().then(function(group){
			EventSchema.find({eventid : {$in : user.events}}, function(err, events){
				if(err){
					console.log(err);
				}
				else{
					respondData(events);
				}
			});
		}).fail(function(err){
			console.log(err);
			respondData(res, null);
		});
	}).fail(function(err){
		console.log(err);
	});
});

//to get the details of one single event inside that group
router.get('/user/:userid/group/:groupid/event/:eventid', function(req, res){
	findUser(req.params.userid).then(function(user){
		findEvent(req.params.eventid).then(function(event){
			respondData(event);
		}).fail(function(err){
			console.log(err);
		});
	}).fail(function(err){
		console.log(err);
	});
});
/*********************************************** EVENTS END*************************************/

/*********************************************** Payment*************************************/

//To get all the payments of user for a particular group
router.get('/user/:userid/group/:groupid/payment', function(req, res){
	findUser(req.params.userid).then(function(user){
		findGroup(req.params.groupid).then(function(group){
			PaymentSchema.find({paymentid : {$in : user.payments}}, function(err, payments){
				if(err){
					console.log(err);
				}
				else{
					respondData(res, payments);
				}
			});
		}).fail(function(err){
			console.log(err);
            		respondData(res, null);
		});
	}).fail(function(err){
		console.log(err);
	});
});

// To pay for the selected group.
router.post('/user/:userid/group/:groupid/pay', function(req, res){
	findUser(req.params.userid).then(function(user){
		findGroup(req.params.groupid).then(function(group){

			var newEvent = new PaymentSchema();
			newEvent.user = user.userid;
			newEvent.amount = req.body.money_required;
			newEvent.date = req.body.created_at;
			newEvent.group = req.body.groupid;
			newEvent.save(function(err, event){
				if(err){
					console.log(err);
				}
				else{
					if(event){
						respondData(event);
					}
					else{

					}
				}
			});

		}).fail(function(err){
			console.log(err);
		});
		
		

	}).fail(function(err){
		console.log(err);
	});
});
/*********************************************** Payment End *************************************/

/*********************************************** User Start *************************************/

router.get('/group/:groupid/users', function(req, res){
	var groupid = req.params.groupid;
	findGroup(groupid).then(function(group){
		console.log(group.users);
		UserSchema.find({userid : {$in : group.users}}, function(err, users){
			if(err){
				console.log(err);
			}
			else{
				respondData(res, users);
			}
		});
	}).fail(function(err){
		console.log(err);
	});
});

/*********************************************** USER End *************************************/

function findUser(userid){
	var deferred = Q.defer();
	UserSchema.findOne({userid: userid}, function(err, user){
		if(err){
			deferred.reject(err);
		}
		else{
			if(user){
				deferred.resolve(user);
			}
			else{
				deferred.reject("No user found");
			}
		}
	});

	return deferred.promise;
}

function findGroup(groupid){
	var deferred = Q.defer();
	GroupSchema.findOne({groupid: groupid}, function(err, group){
		if(err){
			deferred.reject(err);
		}
		else{
			if(group){
				deferred.resolve(group);
			}
			else{
				deferred.reject("No group found");
			}
		}
	});

	return deferred.promise;
}

function findEvent(eventid){
	var deferred = Q.defer();
	EventSchema.findOne({eventid: eventid}, function(err, event){
		if(err){
			deferred.reject(err);
		}
		else{
			if(group){
				deferred.resolve(event);
			}
			else{
				deferred.reject("No event found");
			}
		}
	});

	return deferred.promise;
}

function findPayment(paymentid){
    var deferred = Q.defer();
    PaymentSchema.findOne({paymentid: paymentid}, function(err, payment){
        consle.log("Return Payment");
        if(err){
			deferred.reject(err);
		}
		else{
			if(group){
				deferred.resolve(payment);
			}
			else{
				deferred.reject("No event found");
			}
		}
    });
    
    return deferre.promise;
}

module.exports = router;
