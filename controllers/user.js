const User = require("../models/User");
const ForgotPassword = require("../models/ForgotPassword");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { responseHandler } = require("../helpers/responseHandler");
const { sendMail } = require("../helpers/mailer");

const jwt = require("jsonwebtoken"); //to generate sign token
const expressJwt = require("express-jwt"); // for authorization

const ObjectId = require('mongodb').ObjectId; 


exports.signup = async (req, res) => {
  const user = new User(req.body);
  
  let user_exists = await User.find({ email: req.body.email})
  if(user_exists.length){
	  return responseHandler(res, 'error', [], 'Email already registered.')
  }
  
  user_exists = await User.find({ username: req.body.username})
  if(user_exists.length){
	  return responseHandler(res, 'error', [], 'Username already used.')
  }
  
  user.save((err, user) => {
    if (err) {
      console.log("🚀 ~ file: controllers/user.js:16 ~ signup ~ data:", err)
	  return responseHandler(res, 'db_error', [], err)
    }

    user.salt = undefined;
    user.hashed_password = undefined;

    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //pressist the token as 't' in cookiewith ewpiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return token and user to frontend client

    const { _id, name, email, role , managerId } = user;
	return responseHandler(res, 'success', { token, user: { _id, name, email, role , managerId } })
    // return res.json({ token, user: { _id, name, email, role , managerId } });
  });
};

exports.signin = (req, res) => {
  //find user based on email
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) {
		console.log("🚀 ~ file: controllers/user.js:42 ~ signin ~ data:", err)
		return responseHandler(res, 'db_error', [], err)
    } else if( !user){
		return responseHandler(res, 'error', [], 'User with that email doesn\'t exist.', 401)
	}

    //if user is found make sure the email and password match

    // create authenticate method in user model

    if (!user.authenticate(password)) {
	  return responseHandler(res, 'error', [], 'Email and password don\'t match', 401)
    }
    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    //pressist the token as 't' in cookiewith ewpiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return token and user to frontend client

    const { _id, firstname , lastname , username, email, role } = user;
	return responseHandler(res, 'success', { token, user: { _id, firstname , lastname, email, role } })
    // return res.json({ token, user: { _id, firstname , lastname , username, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // added later
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!user) {
	return responseHandler(res, 'error', [], 'Access denied', 403)
    // return res.status(403).json({
      // error: "Access denied",
    // });
  }
  next();
};

exports.getAllUsers = async (req, res) => {
  
  var perPage = 10;
  var page = Math.max(0, (req.query.page-1));
  let filterCondtn = {};
  
  if(req.query?.role != ''){
	  filterCondtn = {role: req.query?.role};
  }
  
  const users = await User.find(filterCondtn).sort({_id: 1}).limit(perPage).skip(perPage * page).populate("managerId")
  const totalCount = await User.countDocuments(filterCondtn).exec();
  
  let responseData = {perPage: perPage, totalCount: 0, users: {}};
  responseData.totalCount = totalCount;
  responseData.users  = users;
  
  return responseHandler(res, 'success', responseData )
};

exports.getUserById = async (req, res) => {

  let o_id = new ObjectId(req.params.userId);   
  const user = await User .findOne( {"_id" : o_id})
  return responseHandler(res, 'success', user )
};
exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
	return responseHandler(res, 'error', [], 'Admin resourse! Access denied', 403)
  }
  next();
};

exports.getAllManagerUsers = async (req, res) => {

  const users = await User .find( {role: {$ne: 1}} )
  return responseHandler(res, 'success', users )
};

exports.getAllEmployeeUsers = async (req, res) => {

  const users = await User .find( {role:1})
  return responseHandler(res, 'success', users )
};

exports.updateUser = async (req, res) => {

  var userId = req.params.userId;
  var selectedEmployees = req.body?.selectedEmployees;
  let user = await User.find({ _id: userId})

  var conditions = {
	_id : userId 
  }

  var update = {
	  firstname : req.body.firstname,
	  lastname : req.body.lastname,
	  managerId : req.body.managerId,
	  // email : req.body.email;
  }

  User.findOneAndUpdate(conditions, update, async function(error,result){
    if(error){
      return responseHandler(res, 'error', [], error, 403)
    } else{
	  
	  if(result.role == 2){
		  if(selectedEmployees != undefined && selectedEmployees.length > 0){
			  const updated_1 = await User.updateMany({managerId: result._id, role: 1}, { managerId: null });
			  const updated_2 = await User.updateMany({_id: {$in: selectedEmployees}}, { managerId: result._id });
		  }
	  }
		
	  return responseHandler(res, 'success', result )
    }
  });
};

exports.forgotPasswordCheckEmail = async (req, res) => {

  let users = await User.find({ email: req.body.email})
  if(users != null && users.length){
	  let user = users[0];
	  const verification_code = Math.floor(100000 + Math.random() * 900000);
	  // const verification_code = 120830;
	  const data = new ForgotPassword({userId: user._id, verification_code: verification_code});
  
	  data.save((err, model) => {
		if (err) {
		  console.log("🚀 ~ file: controllers/user.js:174 ~ forgotPasswordCheckEmail ~ data:", err)
		  return responseHandler(res, 'db_error', [], err)
		}
		
		//send email
		let mailData = {
			to : user.email,
			subject : `OTP to change your password`,
			html : `Your one time password is <b>${verification_code}</b>`
		}
		
		sendMail(mailData);

		return responseHandler(res, 'success', { token: model._id  }, 'OTP has been sent to Email.')
	  });

  } else {
	  return responseHandler(res, 'error', [], 'Email not registered.', 403)
  }
};

exports.forgotPasswordCheckOTP = async (req, res) => {

  let exists = await ForgotPassword.find({_id: req.body.token}).sort({_id:1})
  if(exists != null && exists.length){
	  let model = exists[0];
	  
	  if(model.is_changed){
		  return responseHandler(res, 'error', [], 'Token expired or already been used.', 403)
	  }
	  
	  if(model.verification_code == req.body.verification_code){
	  
		  ForgotPassword.findOneAndUpdate({_id: model._id}, {is_validated: true}, function(error,result){
			if(error){
			  return responseHandler(res, 'error', [], error, 403)
			} else{
			  return responseHandler(res, 'success', { token: model._id  }, 'OTP has been verified successfully. Please enter new password.')
			}
		  });	  
	  } else {
		   return responseHandler(res, 'error', [], 'Invalid OTP.', 401)
	  }
  } else {
	  return responseHandler(res, 'error', [], 'Invalid Token.', 403)
  }
};

exports.changePassword = async (req, res) => {

  let exists = await ForgotPassword.find({ _id: req.body.token}).sort({_id:1})
  if(exists != null && exists.length){
	  let model = exists[0];
	  
	  if(!model.is_validated){
		  return responseHandler(res, 'error', [], 'OTP is not validated yet.', 403)
	  } else if(model.is_changed){
		  return responseHandler(res, 'error', [], 'Token expired or already been used!', 403)
	  }
	  
	  ForgotPassword.findOneAndUpdate({_id: model._id}, {is_changed: true}, function(error,result){
		if(error){
		  return responseHandler(res, 'error', [], error, 403)
		} else{
		  
		  var conditions = {_id : model._id }

		  var update = {password : req.body.password}

		  User.findOneAndUpdate(conditions, update, function(error,result){
			if(error){
			  return responseHandler(res, 'error', [], error, 403)
			} else{
			  return responseHandler(res, 'success', [], 'Password changed successfully.' )
			}
		  });
		}
	  });	  
	  
  } else {
	  return responseHandler(res, 'error', [], 'Invalid Token!', 403)
  }
};

exports.getAllUsersByRole = async (req, res) => {
  
  const userId = req.params.userId;
  let filterCondtn = {};
  
  let user = await User.findOne({_id: userId});
  
  if(user.role === 2){
	  
	//get manager's teams user_ids
	let team_users = await User.find({managerId: userId});
	let usersIds = team_users.map(function(user) {
	  return user._id;
	});
	
	filterCondtn = {_id: {$in: usersIds}}
	
  } else if(user.role === 0){
	 filterCondtn = {role: {$ne: '0'}}
  }
  
  const users = await User.find(filterCondtn).sort({firstname: 1})
  
  return responseHandler(res, 'success', users )
};

exports.getAllTeamUsers = async (req, res) => {
  
   const userId = req.params.userId;
   let filterCondtn = {};
  
   let team_users = await User.find({managerId: userId});
   let usersIds = team_users.map(function(user) {
	  return user._id;
   });
	
   return responseHandler(res, 'success', usersIds )
};
