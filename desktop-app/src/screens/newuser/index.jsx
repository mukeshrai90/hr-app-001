import React, { useState  , useEffect} from "react";
import { useNavigate } from "react-router-dom";

import { isAuthenticated , signup } from "../../auth";

import Button from "react-bootstrap/Button";
import { Alert, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import CloseButton from 'react-bootstrap/CloseButton';
import { Link } from "react-router-dom";

import ListGroup from 'react-bootstrap/ListGroup';
import {getUsers, getManagerUsers , getUser}  from "../../api/user";

const NewUser = ({setIsLoading}) => {
  const navigate = useNavigate();

  const { user, token } = isAuthenticated();

  const [showmanager, setManagerShow] = React.useState(false);

  const handleCloseManager = () => setManagerShow(false);
  const handleShowManager = () => setManagerShow(true);

  const [users  , setUsers] = useState([])

  useEffect(()=>{
	setIsLoading(true);
    getManagerUsers(token).then((response) => {
	  setIsLoading(false);
	  if (response.status) {
		  setUsers(response.data);
      } else {
        console.log("🚀 ~ file: newuser/index.jsx:37 ~ useEffect ~ data:", response)
      }
    });
  } , [])


  const [values, setValues] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    role: "1",
    managerId : "",
    manager : {},

    success: false,
    error: false,
	errors: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        role: '',
        managerId: '',
    }
  });

  const {
    role,
    firstname,
    lastname,
    username,
    email,
    password,
    error,
    success,
    managerId,
    manager,
	errors,
  } = values;
  
  function validateFrm(name, value){
	  
	  switch (name) {
		  case 'firstname': 
			  errors.firstname = '';
			  if(value.length){
				  
			  } else {
				  errors.firstname = 'First Name is required';
			  }
			break;
		  case 'lastname': 
			  errors.lastname = '';
			  if(value.length){
				  
			  } else {
				  errors.lastname = 'Last Name is required';
			  }
			break;
		  case 'username': 
			  errors.username = '';
			  if(value.length){
				 if(value.length < 6){
					 errors.username = 'Username must be atleast 6 characters long';
				 } else {
					 var usernameRegex = /^[a-zA-Z0-9\_]+$/;
					 if(value.match(usernameRegex)){
					
				     } else{
						errors.username = 'Please enter a valid username';
				     }
				 }
			  } else {
				  errors.username = 'Username is required';
			  }
			break;
		  case 'email': 
			  errors.email = '';
			  if(value.length){
				  const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
	  
				  if(value.match(isValidEmail)){
					
				  } else{
					errors.email = 'Please enter a valid email';
				  }
			  } else {
				  errors.email = 'Email is required';
			  }
			break;
		  case 'password': 
			  errors.password = '';
			  if(value.length){
				  if(value.length >= 6){
					
				  } else{
					errors.password = 'Please enter a valid password. Password must be at-least 6 Characters long.';
				  }
			  } else {
				  errors.password = 'Password is required';
			  }
			break;
		  case 'role': 
			errors.role = 
			  value.length < 1
				? 'Role is required'
				: '';
			break;
		  default:
			break;
      }
  }

  const validateFormSbmt = errors => {
	  
	  validateFrm('firstname', firstname);
	  validateFrm('lastname', lastname);
	  validateFrm('username', username);
	  validateFrm('email', email);
	  validateFrm('password', password);
	  validateFrm('role', role);

	  let valid = true;
	  Object.values(errors).forEach(val => val.length > 0 && (valid = false));
	  
	  if(!valid){
		  setValues({ ...values, errors: errors });
	  }
	  return valid;
  };
  
  const handleSubmit =  (event) => {
	event.preventDefault();
	
	if(!validateFormSbmt(errors)) {
      console.error('Invalid Form');
      console.error(errors);
	  return false;
    }
	
	if(!manager._id && role == "1"){
      setValues({...values, error :  "Please select manager"})
      return ;
    }

    setValues({ ...values, error: false });
	
	setIsLoading(true);
	signup(
      {
        role,
        firstname,
        lastname,
        username,
        email,
        password,
        managerId : manager._id != undefined ? manager._id : null
      },
      token
    ).then((response) => {
	  console.log("🚀 ~ file: newuser/index.jsx:200 ~ signup ~ data:", response)
	  setIsLoading(true);
      if (response.status) {
		window.scrollTo(0,0);
		setValues({
          firstname: "",
          lastname: "",
          username: "",
          email: "",
          password: "",
          role: "1",
		  manager: {},
          success: true,
          error: false,
		  errors: {
			firstname: '',
			lastname: '',
			username: '',
			email: '',
			password: '',
			role: '',
			managerId: '',
		  }
        });
      } else {
		window.scrollTo(0,0);
		setValues({
          ...values,
          error: response.error || response.err || "check the require field",
          success: false,
        });
	  }
    });
  }
  
  const handleChange = (name) => (event) => {
	const value = event.target?.value;

    validateFrm(name, value);
	
	setValues({ ...values, errors: errors, [name]: value });
  };

  const reset = () => {
    setValues({
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      role :  "1",
      managerId : "",
      manager : {},

      success: false,
      error: false,
	  errors: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        role: '',
        managerId: '',
      }
    });
  };
  
  const resetManger = () =>{
    setValues({
      ...values , 
      
      manager : {},
     
    });
  }
  
  const saveChanges =  () =>{
	setIsLoading(true);
    getUser(token , managerId).then((response) => {
	  setIsLoading(false);
      if (response.status) {
		  setValues({
            ...values,
            manager : {...response.data}
          });
      } else {
		 console.log("🚀 ~ file: newuser/index.jsx:287 ~ saveChanges ~ data:", response)
	  }
    });
    
    handleCloseManager()
  }
  
  return (
    <div>
	  <div style={{marginBottom:30+'px',marginTop:5+'px', textAlign:'right'}}>
		<Link to="/home" style={{color:'#212529'}}>Back to Dashboard</Link>
	  </div>
	  
      <Form>
        <div class="new-reqst-msg">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">User added</Alert>}
        </div>
        <Card className="p-1 mb-1">
          <h3 className="text-center">Create New User</h3>
          <Form.Group as={Row} className="mb-1">
            <Form.Label column sm="5">
              FirstName <span className="text-muted">(*)</span>
            </Form.Label>
            <Col sm="7">
              <Form.Control
                type="text"
                value={firstname}
                onChange={handleChange("firstname")}
                placeholder="Firstname"
              />
			  {errors.firstname.length > 0 && 
							<span className='spn-error'>{errors.firstname}</span>}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-1">
            <Form.Label column sm="5">
              Lastname <span className="text-muted">(*)</span>
            </Form.Label>
            <Col sm="7">
              <Form.Control
                type="text"
                value={lastname}
                onChange={handleChange("lastname")}
                placeholder="Lastname"
              />
			  {errors.lastname.length > 0 && 
							<span className='spn-error'>{errors.lastname}</span>}
            </Col>
          </Form.Group>

          <Form.Group className="mb-1">
			<Form.Label column sm="5">
              Username <span className="text-muted">(*)</span>
            </Form.Label>
            <Col sm="7">
              <Form.Control
              placeholder="Username"
              value={username}
              onChange={handleChange("username")}
            />
			 {errors.username.length > 0 && 
							<span className='spn-error'>{errors.username}</span>}
            </Col>
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label column sm="5">
              Email <span className="text-muted">(*)</span>
            </Form.Label>
			<Col sm="7">
				<Form.Control
				  placeholder="Email"
				  value={email}
				  onChange={handleChange("email")}
				/>
				{errors.email.length > 0 && 
							<span className='spn-error'>{errors.email}</span>}
            </Col>
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label column sm="5">
              Password <span className="text-muted">(*)</span>
            </Form.Label>
			<Col sm="7">
				<Form.Control
				  placeholder="Password"
				  value={password}
				  onChange={handleChange("password")}
				/>
				{errors.password.length > 0 && 
							<span className='spn-error'>{errors.password}</span>}
            </Col>
          </Form.Group>
        </Card>
        <Card className="p-1 mb-1">
            <Form.Group as={Row} className="mb-1">
				<Col sm="12">
					<Form.Label>
						Role : <span className="text-muted">(*)</span>
					</Form.Label>
				</Col>
			</Form.Group>
			<Form.Group as={Row} className="mb-1">
				<Col sm="12">
				  <Form.Label>User</Form.Label>
				  <Form.Check
					name="role"
					defaultChecked={role == "1"}
					onChange={handleChange("role")}
					value={"1"}
					type="radio"
					label=""
				/>
				</Col>
			</Form.Group>
			<Form.Group as={Row} className="mb-1">
				<Col sm="12">
				  <Form.Label>Admin HR</Form.Label>
				  <Form.Check
					name="role"
					onChange={handleChange("role")}
					value={"0"}
					type="radio"
					defaultChecked={role == "0"}
					label=""
				  />
				</Col>
			</Form.Group>
			<Form.Group as={Row} className="mb-1">
				<Col sm="12">
				  <Form.Label>Manager</Form.Label>
				  <Form.Check
					name="role"
					onChange={handleChange("role")}
					value={"2"}
					type="radio"
					label=""
					defaultChecked={role == "2"}
				  />
				</Col>
			</Form.Group>
			{errors.role.length > 0 && <span className='spn-error'>{errors.role}</span>}
			<Form.Group as={Row} className="mb-1">
				<Col sm="12">
				  <Button variant="primary" onClick={handleShowManager} disabled={role != 1}>
					Select the manager
				  </Button>
				</Col>
			</Form.Group>
           {
             manager._id !=undefined && <Form.Group as={Row} className="mb-1">
               <Col sm="6" >
				  <Card>
					<div style={{textAlign :  "right"}}>
						<CloseButton onClick={resetManger} />
					</div>
					<small style={{padding:5+'px'}}>
						{manager.firstname} {manager.lastname}
						<br />
						{manager.email}
					</small>
				  </Card>
				</Col>
			 </Form.Group>
           }            
        </Card>

        <div className="d-grid gap-2">
          <Button variant="secondary" type="button" onClick={reset} size="md">
            Reset
          </Button>
          <Button className="mb-1" variant="primary" type="submit" size="md" onClick={handleSubmit}>
            Submit
          </Button>

          <Button variant="danger" onClick={() => navigate("/home")} size="md">
            Cancel
          </Button>
        </div>
      </Form>
	  
	  <Modal show={showmanager} onHide={handleCloseManager}>
		  <Modal.Header closeButton>
			<Modal.Title>Managers</Modal.Title>
		  </Modal.Header>
		  <Modal.Body>
              <ListGroup as="ol" numbered>
              {
                  users.map(user=>{
                    return user.role == 2 && (
                      <ListGroup.Item
                      as="li"
					  key={user._id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{user.firstname} {user.lastname}</div>
                        {user.email}
                      </div>
                      
                      <Form.Check
                         name="managerId"
                         onChange={handleChange("managerId")}
                          value={user._id}
                           type="radio"
                          label=""
                />
                    </ListGroup.Item>
                    )
                  })
                }
			 </ListGroup>                
          </Modal.Body>
		  <Modal.Footer>
			<Button variant="secondary" onClick={handleCloseManager}>
			  Close
			</Button>
			<Button variant="primary" onClick={saveChanges}>
			  Save Changes
			</Button>
		  </Modal.Footer>
       </Modal>
	  
    </div>
  );
};

export default NewUser;
