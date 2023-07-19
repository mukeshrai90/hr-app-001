import { useState } from "react";

import { Navigate, Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import logo from "../../logo.svg";

import { authenticateEmail, authenticateOTP, changePassword } from "../../auth";

function ForgotPassword({setIsLoading}) {

  const [values, setValues] = useState({
    email: "",
    verification_code: "",
    password: "",
    confirm_password: "",
	errorFlg: true,
  });
  
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  
  const [error, setError] = useState({errorMsg: ""});
  
  const [errorMsgOTP, setErrorMsgOTP] = useState("");
  const [successMsgOTP, setSuccessMsgOTP] = useState("");
  const [errorMsgChangePass, setErrorMsgChangePass] = useState("");
  const [successMsgChangePass, setSuccessMsgChangePass] = useState("");
  
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { email, verification_code, password, confirm_password, errorFlg } = values;
  const { errorMsg } = error;

  const handleChange = (name) => (event) => {
	  setValues({ ...values, errorFlg: false, [name]: event.target.value });
  };
  
  const handleSubmitEmail = (event) => {
      event.preventDefault()
	  
	  if(!validateEmail(email)){
		  setError({ ...error, errorMsg: "Please enter a valid email" });
		  return false;
	  }
	  
	  setIsLoading(true);
      authenticateEmail({ email }).then(
        (response) => {
		  setIsLoading(false);
          if (response.status) {
			  setToken(response.data.token);
              setShowEmailForm(false);
              setShowOTPForm(true);
              setSuccessMsgOTP(response.message);
          } else {
			 console.log("🚀 ~ file: forgotPasword/index.jsx:48 ~ handleSubmit ~ data:", response)
			 setError({ ...error, errorMsg: response.error });
          }
        }
      );
  };
  
  const handleSubmitOTP = (event) => {
      event.preventDefault()
	  
	  setSuccessMsgOTP('');
	  
	  if(verification_code == '' || verification_code.length != 6){
		  setErrorMsgOTP("Please enter OTP");
		  return false;
	  }
	  
	  setIsLoading(true);
      authenticateOTP({ verification_code, token }).then(
        (response) => {
		  setIsLoading(false);
          if (response.status) {
              setShowOTPForm(false);
              setShowPasswordForm(true);
			  setSuccessMsgChangePass(response.message);
          } else {
			 console.log("🚀 ~ file: forgotPasword/index.jsx:48 ~ handleSubmit ~ data:", response)
			 setErrorMsgOTP(response.error);
          }
        }
      );
  };
  
  const handleSubmitNewPassword = (event) => {
      event.preventDefault()
	  
	  setSuccessMsgChangePass('');
	  
	  if(password === "" || password.length < 6){
		  setErrorMsgChangePass("Please enter a valid password. Password must be at-least 6 Characters long.");
		  return false;
	  } else if(confirm_password === "" || confirm_password.length < 6){
		  setErrorMsgChangePass("Please enter a valid confirm password.");
		  return false;
	  } else if(password !== confirm_password){
		  setErrorMsgChangePass("Both passwords do not match. Please check.");
		  return false;
	  }
	  
	  setIsLoading(true);
      changePassword({ password, confirm_password, token }).then(
        (response) => {
		  if (response.status) {
			 setValues({ ...values, password: '', confirm_password: '' });
			 setErrorMsgChangePass("");
             setSuccessMsgChangePass(response.message);
			 
			 setTimeout(() => {
				 navigate("/");
			 }, 3000);
			 
          } else {
			 setIsLoading(false);
			 console.log("🚀 ~ file: forgotPasword/index.jsx:48 ~ handleSubmit ~ data:", response)
			 setErrorMsgChangePass(response.error);
          }
        }
      );
  };
  
  const validateEmail = (email) => {
	  const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
	  
	  if(email && email.match(isValidEmail)){
		return true;
	  } else{
		return false;
	  }
  }
  
  return (
    <div>
      
      <div className="text-center">
        <img src={logo} alt="" width="300" height="200" />
      </div>
	  {
		  showEmailForm ? <>
			  <Form onSubmit={handleSubmitEmail}>
				<Form.Group>
				  <div style={{ height: 66 }}>
					{errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
				  </div>

				  <Form.Group className="mb-1" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
					  type="email"
					  placeholder="Enter email"
					  value={email}
					  onChange={handleChange("email")}
					/>
				  </Form.Group>

				  <Form.Group className="mb-1">
					<Link to="/">Back to Login</Link>
				  </Form.Group>
				</Form.Group>
				<div className="d-grid gap-2">
				  <Button variant="primary" type="submit" size="md" disabled={errorFlg === true}>
					Submit
				  </Button>
				</div>
			  </Form>
		  </> : ''
	  }
	  
	  {
	     showOTPForm ? <>
			  <Form onSubmit={handleSubmitOTP}>
				<Form.Group>
				  <div style={{ height: 66 }}>
					{errorMsgOTP && <Alert variant="danger">{errorMsgOTP}</Alert>}
					{successMsgOTP && <Alert variant="success">{successMsgOTP}</Alert>}
				  </div>

				  <Form.Group className="mb-1" controlId="formBasicEmail">
					<Form.Label>One Time Password</Form.Label>
					<Form.Control
					  type="tel"
					  placeholder="Enter One Time Password"
					  value={verification_code}
					  maxlength="6"
					  onChange={handleChange("verification_code")}
					/>
				  </Form.Group>

				  <Form.Group className="mb-1">
					<Link to="/">Back to Login</Link>
				  </Form.Group>
				</Form.Group>
				<div className="d-grid gap-2">
				  <Button variant="primary" type="submit" size="md" disabled={errorFlg === true}>
					Submit
				  </Button>
				</div>
			  </Form>
		  </> : ''
	  }
	  
	  {
		  showPasswordForm ? <>
			  <Form onSubmit={handleSubmitNewPassword}>
				<Form.Group>
				  <div style={{ height: 66, marginBottom: 15+'px' }}>
					{errorMsgChangePass && <Alert variant="danger">{errorMsgChangePass}</Alert>}
					{successMsgChangePass && <Alert variant="success">{successMsgChangePass}</Alert>}
				  </div>

				  <Form.Group className="mb-1" controlId="formBasicPassword">
					<Form.Label>New Password</Form.Label>
					<Form.Control
					  type="password"
					  placeholder="Password"
					  value={password}
					  onChange={handleChange("password")}
					/>
				  </Form.Group>

				  <Form.Group className="mb-1" controlId="formBasicPassword">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
					  type="password"
					  placeholder="Confirm Password"
					  value={confirm_password}
					  onChange={handleChange("confirm_password")}
					/>
				  </Form.Group>
				</Form.Group>
				<div className="d-grid gap-2">
				  <Button variant="primary" type="submit" size="md" disabled={errorFlg === true}>
					Submit
				  </Button>
				</div>
			  </Form>
		  </> : ''
	  }
    </div>
  );
}

export default ForgotPassword;
