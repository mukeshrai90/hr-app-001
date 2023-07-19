
"use strict";

/**
 * set response object
 */
exports.responseHandler = (res, type, res_data, err, statusCode=400) => {
    
	if(type == 'success'){
		return res.status(200).json({ status: true, data: res_data, message: err});
	} else if(type == 'error'){
		return res.status(statusCode).json({ status: false, error: err, data: res_data});
	} else if(type == 'db_error'){
		return res.status(statusCode).json({ status: false, error: errorHandler(err)});
	}
};