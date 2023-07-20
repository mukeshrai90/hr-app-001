
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	port: 587,
	host: "smtp-relay.brevo.com",
	auth: {
		user: 'mukesh.rai@rupeepower.com',
		pass: 'qarv5TDO4yKYQBnW',
	},
	secure: false,
});


exports.sendMail = (mailOptions) => {
	mailOptions = {...mailOptions, from: 'mukesh.rai@rupeepower.com'}
	transporter.sendMail(mailOptions, function (err, info) {
	   if(err)
		 console.log(err)
	   else
		 console.log(info);
	});
};