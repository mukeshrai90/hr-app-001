import { useState } from "react";

import { Navigate, Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import logo from "../../logo.svg";
import { authenticate, isAuthenticated, signin } from "../../auth";

function Login({setIsLoading}) {

  const [values, setValues] = useState({
    email: "",
    password: "",
	errorFlg: true,
  });
  
  const [error, setError] = useState({
	errorMsg: ""
  });

  const { email, password, errorFlg } = values;
  const { errorMsg } = error;

  const handleChange = (name) => (event) => {
	  setValues({ ...values, errorFlg: false, [name]: event.target.value });
  };
  const handleSubmit = (event) => {
      event.preventDefault()
	  
	  if(!validateEmail(email)){
		  setError({ ...error, errorMsg: "Please enter a valid email" });
		  return false;
	  } else if(password === "" || password.length < 6){
		  setError({ ...error, errorMsg: "Please enter a valid password. Password must be at-least 6 Characters long." });
		  return false;
	  }
	  
	  setIsLoading(true);
      signin({ email, password }).then(
        (response) => {
		  setIsLoading(false);
          if (response.status) {
             authenticate(response.data, ()=>{
                 window.location.reload()             
             })
          } else {
			 console.log("🚀 ~ file: login/index.jsx:48 ~ handleSubmit ~ data:", response)
			 setError({ ...error, errorMsg: response.error });
          }
        }
      );
  };
  
  const navigate = ()=>{
      if(isAuthenticated()){
        return  <Navigate to="/home" />
      }
      return null;
  }
  
  const navigateForgotPass = ()=>{
       return <Navigate to="/forgot-password" />
  }
  
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
	  
      {navigate()}
      
      <div className="text-center">
        <img src={logo} alt="" width="300" height="200" />
      </div>

      <Form onSubmit={handleSubmit}>
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
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-1" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleChange("password")}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Link to="/forgot-password">Forgot Password?</Link>
          </Form.Group>
        </Form.Group>
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" size="md" disabled={errorFlg === true}>
            Login
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Login;
