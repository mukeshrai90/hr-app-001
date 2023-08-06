const mongoose = require("mongoose");

const ObjectId =  mongoose.Schema.ObjectId;

const RequestSchema = new mongoose.Schema({
  
    userId : { type : ObjectId, ref: 'User' },
    start_date : {
        type : Date,                
    },
    end_date : {
        type : Date,                
    },
    request_type : {
        type : String,
        required : true,
    },
    reason : {
        type : String,
        required : true,        
    },
    state : {
        type : String,
        required : true,
        enum : ['pending', 'canceled', "rejected", "approved"],
        default :  "pending"
    },
	comment: {
		type : String,
	},
	action_By : { 
		type : ObjectId, ref: 'User' 
	},
	action_At : {
        type : Date,                
    },

}, {timestamps : true})




module.exports = mongoose.model("Request", RequestSchema)