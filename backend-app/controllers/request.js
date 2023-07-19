const Request = require("../models/Request");
const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { responseHandler } = require("../helpers/responseHandler");

exports.create = async (req, res) => {
  const userId = req.params.userId;
  const start_date_req = new Date(req.body.start_date).toISOString();
  const end_date_req = new Date(req.body.end_date).toISOString();
  const request = new Request({ ...req.body, userId });
  console.log(start_date_req, end_date_req);
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
  
  request.save((err, request) => {
    if (err) {
	  console.log("🚀 ~ file: controllers/request.js:35 ~ deleteRequest ~ _data:", err)
      return responseHandler(res, 'db_error', [], err)
    }

	return responseHandler(res, 'success', request)
  });
};

exports.getAllRequestByUserId = async (req, res) => {
  try {
	
	var perPage = 10;
    var page = Math.max(0, (req.query.page-1));
	let filterCondtn = {};
	
	let user = await User.findOne({_id: req.params.userId});
	
	let states = ["pending"];
	if(req.params.type == 'completed'){
		states = ["approved", "rejected", "canceled"];
		if(user.role === 1){
			states = ["approved", "rejected"];
		}
	} else if(req.params.type == 'approvals'){
		states = [req.params.state];
	}
	
	if(user.role === 1){
		filterCondtn = { userId: req.params.userId, state: {$in: states} };
	  
    } else if(user.role === 2){
		if(req.params.type == 'approvals'){
			
			//get manager's teams user_ids
			let team_users = await User.find({managerId: req.params.userId});
			let usersIds = team_users.map(function(user) {
			  return user._id;
			});
			
			filterCondtn = { state: {$in: states}, userId: {$in: usersIds} };
			
		} else {
			filterCondtn = { userId: req.params.userId, state: {$in: states} };
		}
	} else if(user.role === 0){
		if(req.params.type == 'approvals'){
			filterCondtn = { state: {$in: [req.params.state]} };
		} else {
			filterCondtn = { state: {$ne: "canceled"}, state: {$in: states} };	
		} 
    }
	
	let totalCount = await Request.countDocuments(filterCondtn).exec();
	let requests = await Request.find(filterCondtn).sort({start_date: 1}).limit(perPage).skip(perPage * page).populate("userId")
    
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


exports.updateRequestState =  (req, res) => {
  Request.findByIdAndUpdate(req.params.id , {state : req.params.state}, function (err, docs) {
    if (err){
      console.log("🚀 ~ file: controllers/request.js:116 ~ updateRequestState ~ _data:", err)
      res.status(500).json(err);
	  return responseHandler(res, 'db_error', [], err, 500)
    }
    else{
	  return responseHandler(res, 'success')
    }
});

};
