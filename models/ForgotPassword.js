const mongoose = require("mongoose");

const ObjectId =  mongoose.Schema.ObjectId;

const ForgotPasswordSchema = new mongoose.Schema({
  
    userId : {
        type : String,
        required : true,        
    },
    verification_code : {
        type : Number,
        required : true,        
    },
	is_validated : {
		type : Boolean, 
		default: false
	},
	is_changed : {
		type : Boolean, 
		default: false
	}
    
}, {timestamps : true})

module.exports = mongoose.model("ForgotPassword", ForgotPasswordSchema)