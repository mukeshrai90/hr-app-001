exports.userSignupValidator = function (req, res,next){
    
   
    req.check("firstname","Firstname is required").notEmpty()
    req.check("lastname","Lastname is required").notEmpty()
    req.check("username","username is required").notEmpty()
  
    req.check("email","Email must be between 4 and 32 charecters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must cointain @")
    .isLength({
        min : 4,
        max : 32
    })
    req.check("password", "Password is required").notEmpty()
    req.check("password", ).isLength({
        min : 6
    })
    .withMessage("Password must contain at least 6 charecters")
    .matches(/\d/)
    .withMessage("Password must contain a number")


   
    const errors = req.validationErrors()
    if(errors){
        const firstError = errors.map(error=>error.msg)[0];
        return res.status(400).json({
            error : firstError
        })

    }
    next()
}

