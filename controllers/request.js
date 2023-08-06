const Request = require("../models/Request");
const User = require("../models/User");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { responseHandler } = require("../helpers/responseHandler");
const { sendMail } = require("../helpers/mailer");

exports.create = async (req, res) => {
  const userId = req.params.userId;
  const start_date_req = new Date(req.body.start_date).toISOString();
  const end_date_req = new Date(req.body.end_date).toISOString();
  const request = new Request({ ...req.body, userId });
  
  let user = await User.findOne({_id: userId});
  if(!user || user == undefined || Object.keys(user).length === 0){
	return responseHandler(res, 'error', [], 'Invalid user')
  }

  let requests = await Request.find({ userId: userId, state: {$nin: ["canceled", "rejected"]}, 
							$or: [{
									start_date: {$gte: start_date_req, $lte: end_date_req},
								  },
								  {
									start_date: {$lte: start_date_req},
									end_date: {$gte: start_date_req, $lte: end_date_req}
								  },
								  {
									start_date: {$lte: start_date_req},
									end_date: {$gte: end_date_req}
								  }
							],
					   })
  if(requests.length){
	  let requestIds = requests.map(function(request) {
	     return request._id;
	  });
	  return responseHandler(res, 'error', requestIds, 'Leave Request already exist with overlapping dates.')
  }
  
  request.save(async (err, request) => {
    if (err) {
	  console.log("🚀 ~ file: controllers/request.js:35 ~ deleteRequest ~ _data:", err)
      return responseHandler(res, 'db_error', [], err)
    }
	
	//send email now
	
	let hr_admin = await User.findOne({role: 0}).sort({_id:1});
	
	let manager = {};
	if(user?.managerId != undefined && user.managerId != ''){
		manager  = await User.findOne({_id: user.managerId});
	}
	
	let toEmails = [];
	if(hr_admin && hr_admin != undefined && Object.keys(hr_admin).length > 0 && hr_admin._id != undefined){
		toEmails.push(hr_admin.email);
	}
	if(manager && manager != undefined && Object.keys(manager).length > 0 && manager._id != undefined){
		toEmails.push(manager.email);
	}
	
	if(toEmails.length){
		
		let start_date = new Date(request.start_date).toISOString().substring(0, 10);
		let end_date = new Date(request.end_date).toISOString().substring(0, 10);
		
		let mailData = {
			subject : `New Leave Request from ${user.firstname} ${user.lastname}`,
			html : `Leave Request Details: <br/><br/>Start date: ${start_date}<br/>End date: ${end_date}<br/>Request Type: ${request.request_type}<br/>Reason: ${request.reason}`
		}
		
		for(email of toEmails){
			mailData.to = email;
			sendMail(mailData);
		}
	}
	
	return responseHandler(res, 'success', request)
  });
};

exports.getAllRequestByUserId = async (req, res) => {
  try {
	
	var perPage = 10;
    var page = Math.max(0, (req.query.page-1));
	let filterCondtn = {};
	
	if(req.query?.user != '' && req.query?.user != 'undefined'){
	  filterCondtn = {...filterCondtn, userId: req.query?.user};
    }
	
	let requestState = req.params.state;
	let requestType = req.params.type;
	let userId = req.params.userId;
	let user = await User.findOne({_id: userId});
	
	let states = ["pending"];
	if(requestType == 'completed'){
		states = ["approved", "rejected", "canceled"];
		if(user.role === 1){
			states = ["approved", "rejected"];
		}
	} else if(requestType == 'approvals'){
		states = [requestState];
	}
	
	if(user.role === 1){
		filterCondtn = {...filterCondtn, userId: userId, state: {$in: states} };
	  
    } else if(user.role === 2){
		if(requestType == 'approvals'){
			
			let teamFilterCondtn = {managerId: userId}
			if(req.query?.user != '' && req.query?.user != 'undefined'){
			   teamFilterCondtn = {...teamFilterCondtn, _id: req.query?.user};
			}
			
			//get manager's teams user_ids
			let team_users = await User.find(teamFilterCondtn);
			let usersIds = team_users.map(function(user) {
			  return user._id;
			});
			
			filterCondtn = {};
			filterCondtn = {...filterCondtn, state: {$in: states}, userId: {$in: usersIds} };
			
		} else {
			filterCondtn = {...filterCondtn, userId: userId, state: {$in: states} };
		}
	} else if(user.role === 0){
		if(requestType == 'approvals'){
			filterCondtn = {...filterCondtn, state: {$in: [requestState]} };
		} else {
			filterCondtn = {...filterCondtn, state: {$ne: "canceled"}, state: {$in: states} };	
		} 
    }
	
	let totalCount = await Request.countDocuments(filterCondtn).exec();
    let requests = await Request.find(filterCondtn).sort({start_date: 1}).limit(perPage).skip(perPage * page).populate({path:"userId", model: 'User', populate: {path: 'managerId', model: 'User'}}).populate({path: 'action_By', model: 'User'});
    
	let responseData = {perPage: perPage, totalCount: 0, requests: {}};
	responseData.totalCount = totalCount;
	responseData.requests  = requests;
	
	return responseHandler(res, 'success', responseData)
  
  } catch (err) {
	 console.log("🚀 ~ file: controllers/request.js:94 ~ getAllRequestByUserId ~ _data:", err)
	 return responseHandler(res, 'error', [], err, 500)
  }
};


exports.deleteRequest =  (req, res) => {
  Request.findByIdAndDelete(req.params.id, function (err, docs) {
    if (err){
      console.log("🚀 ~ file: controllers/request.js:103 ~ deleteRequest ~ _data:", err)
	  return responseHandler(res, 'db_error', [], err, 500)
    } else{
	  return responseHandler(res, 'success')
    }
});

};


exports.updateRequestState =  async (req, res) => {
	
  let loggedUserId = req.auth._id;
  
  let request = await Request.findOne({_id: req.params.id}).populate("userId", "_id firstname lastname")
  if(Object.keys(request).length === 0){
	return responseHandler(res, 'error', [], 'Invalid request')
  }
  
  let state = req.params.state;
  let comment = req?.body?.comment;
  let cunntTime = new Date().toISOString();
  
  Request.findByIdAndUpdate(req.params.id, {state:state, comment:comment, action_By:loggedUserId, action_At:cunntTime}, function (err, docs) {
    if (err){
      console.log("🚀 ~ file: controllers/request.js:116 ~ updateRequestState ~ _data:", err)
      res.status(500).json(err);
	  return responseHandler(res, 'db_error', [], err, 500)
    }
	
	
	if(state == 'approved' || state == 'rejected'){
	
		let toEmails = [request.userId.email];
		
		if(toEmails.length){
			
			let start_date = new Date(request.start_date).toISOString().substring(0, 10);
			let end_date = new Date(request.end_date).toISOString().substring(0, 10);
			
			let mailData = {
				subject : `Your leave has been ${state}`,
				html : `Leave Request Details: <br/><br/>Start date: ${start_date}<br/>End date: ${end_date}<br/>Request Type: ${request.request_type}<br/>Reason: ${request.reason}<br><br/>Comment: ${comment}`
			}
			
			for(email of toEmails){
				mailData.to = email;
				sendMail(mailData);
			}
		}
	}
	
	return responseHandler(res, 'success')
});

};
