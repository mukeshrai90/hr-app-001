import React from "react";

import { Link } from "react-router-dom";

import { getUser, getUsers, getManagerUsers, updateUser } from "../../api/user";

import { isAuthenticated } from "../../auth";
import { cap, role as _role } from "../../utils";

import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import Modal from '../../utils/Model';
import ModalTitle from '../../utils/ModalTitle';
import ModalHeader from "../../utils/ModalHeader"
import ModalBody from '../../utils/ModalBody';
import ModalFooter from '../../utils/ModalFooter';
import { Alert, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import CloseButton from 'react-bootstrap/CloseButton';
import Pagination from '../../utils/Pagination/Pagination';

const Users = ({setIsLoading}) => {
  const { user, token } = isAuthenticated();
  const [users, setUsers] = React.useState([]);
  const [manager_users, setManagerUsers] = React.useState([]);
  const [refresh, setRefresh] = React.useState('');
  
  const [currentPage, setCurrentPage] = React.useState(1);  
  const [totalCount, setTotalCount] = React.useState(0);
  const [perPage, setPerPage] = React.useState(0);
  
  const [values, setValues] = React.useState({
    userId: 0,
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
        role: '',
        managerId: '',
    }
  });

  const {
    userId,
    firstname,
    lastname,
    username,
    email,
    password,
	role,
    managerId,
    manager,
	success,
	error,
	errors
  } = values;
  
  const [managerModalShow, setManagerModalShow] = React.useState(false);

  const handleModalCloseManager = () => setManagerModalShow(false);
  const handleModalShowManager= () => setManagerModalShow(true);

  const [modalShow, setModalShow] = React.useState(false);
  
  const [role_filter, setRoleFilter] = React.useState('');
  
  React.useEffect(() => {
	setIsLoading(true);
    getUsers(token, currentPage, role_filter).then((response) => {
	  setIsLoading(false);
      if (response.status) {
		  setUsers(response.data.users);
		  setTotalCount(response.data.totalCount);
		  setPerPage(response.data.perPage);
      } else {
        console.log("🚀 ~ file: users/index.jsx:88 ~ useEffect ~ data:", response)
      }
    });
  }, [refresh, currentPage, role_filter]);
  
  React.useEffect(() => {
	setIsLoading(true);
    getManagerUsers(token).then((response) => {
	  setIsLoading(false);
	  if (response.status) {
		  setManagerUsers(response.data);
      } else {
        console.log("🚀 ~ file: users/index.jsx:100 ~ useEffect ~ data:", response)
      }
    });
  }, []);

  const handleModalClose = () => setModalShow(false);
  
  const filterUsersByRole = (event) => {setRoleFilter(event.target?.value);}
  
  const handleShow = (user) => {
    console.log('handleShow', user)
    if(user.managerId){
      setValues({values , ...user , manager : {...user.managerId }  , managerId : user.managerId._id, errors: errors, userId:user._id })
    }else{
      setValues({values , ...user, errors: errors, userId:user._id })
    }
    
	setModalShow(true)
  };
  
  function validateFrm(name, value){
	  
	  switch (name) {
		  case 'firstname': 
			  errors.firstname = '';
			  if(value.length){
				  
			  } else {
				  errors.start_date = 'First Name is required';
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
	updateUser(
      {
        firstname,
        lastname,
        username,
        email,
		role,
        managerId : manager._id != undefined ? manager._id : ''
      },
	  userId,
      token
    ).then((response) => {
	  setIsLoading(false);
      if (response.status) {
		  setValues({
			  firstname: "",
			  lastname: "",
			  username: "",
			  email: "",
			  password: "",
			  role: "1",
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
		  
		  handleModalClose();
		  setRefresh(Math.random() * (100 - 1) + 1);
        
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
	  
    // setValues({ ...values, error: false, [name]: event.target.value });
  };
  
  const resetManger =  ()=>{

  }
  
  const saveChanges =  () =>{
    getUser(token , managerId).then((response) => {
      if (response.status) {
		  setValues({
            ...values,
            manager : {...response.data}
          });
          setTimeout(()=>{
            console.log(values)
          } , 3000)
      } else {
		  console.log("🚀 ~ file: users/index.jsx:281 ~ saveChanges ~ data:", response)
      }
    });
    
    handleModalCloseManager()
  }
  return (
    <div>
      <div style={{marginBottom:30+'px',marginTop:5+'px', textAlign:'right'}}>
		<Link to="/home" style={{color:'#212529'}}>Back to Dashboard</Link>
	  </div>
	  <h1 className="text-center">Users List</h1>
	  
	  <Form.Select aria-label="Select Role" onChange={filterUsersByRole} style={{marginBottom: 20+'px'}}>
		  <option disabled>Select Role to filter</option>
		  <option value=''>All</option>
		  <option value="0">HR Admin</option>
		  <option value="1">User</option>
		  <option value="2">Manager</option>
	  </Form.Select>
	  
      <div style={{overflow : "auto"}}>
		<ListGroup  >
			{users.map((user) => {
			  return (
				<ListGroup.Item >
				  <Row>
					  <Col sm="7">
						<b>
						  {user.firstname} {user.lastname} [{_role(user.role)}]
						</b>
						<br />
						<small>{user.email}</small>
					  </Col>

					  <Col sm="5" style={{textAlign: 'right'}}>
						{ /*<Button variant="danger" size="sm" >Delete</Button> */ }
					    <Button variant="info" size="sm" onClick={()=>handleShow(user)}>Edit</Button>{' '}					   
					  </Col>
				  </Row>
				</ListGroup.Item>
			  );
			})}
		  </ListGroup>
     </div>
	 {
		users.length ? <>
		<Pagination
			className="pagination-bar"
			currentPage={currentPage}
			totalCount={totalCount}
			pageSize={perPage}
			onPageChange={page => setCurrentPage(page)}
		 />
		</> : '' 
	 }

     <Modal show={modalShow} onHide={handleModalClose} size="sm">
        <ModalHeader onHide={handleModalClose}  >
          <ModalTitle>Edit User</ModalTitle>
        </ModalHeader>
        <ModalBody>
        {
          values._id && <>

          <Form>
			  <div class="new-reqst-msg">
				{error && <Alert variant="danger">{error}</Alert>}
				{success && <Alert variant="success">Edit User</Alert>}
			  </div>

			<Card className="p-1 mb-1">
				<Form.Group as={Row} className="mb-1">
					<Form.Label column sm="5">
						First Name <span className="text-muted">(*)</span>
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
						Last Name <span className="text-muted">(*)</span>
					</Form.Label>
					<Col sm="7">
						<Form.Control
							type="text"
							value={lastname}
							onChange={handleChange("lastname")}
							placeholder="Lastname"
						/>
						{errors.lastname.length > 0 && <span className='spn-error'>{errors.lastname}</span>}
					</Col>
				</Form.Group>
				<Form.Group className="mb-1">
					<Form.Label>
						Username <span className="text-muted">(*)</span>
					</Form.Label>
					<Form.Control
						placeholder="Username"
						value={username}
						onChange={handleChange("username")}
						disabled="disabled"
					/>
				</Form.Group>

				<Form.Group className="mb-1">
					<Form.Label>
						Email <span className="text-muted">(*)</span>
					</Form.Label>
					<Form.Control
						placeholder="Email"
						value={email}
						onChange={handleChange("email")}
						disabled="disabled"
					/>
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
						disabled="disabled"
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
						disabled="disabled"
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
						disabled="disabled"
					  />
					</Col>
				</Form.Group>
				{errors.role.length > 0 && <span className='spn-error'>{errors.role}</span>}
				<Form.Group as={Row} className="mb-1">
					<Col sm="12">
					  <Button variant="primary" onClick={handleModalShowManager} disabled={(role != 1 && role != 2)}>
						Select the manager
					  </Button>
					</Col>
				</Form.Group>

            {
             manager && 
				<Form.Group as={Row} className="mb-1"> 
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
		  </Form>
          </>

        }
        
        
       </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      <Modal show={managerModalShow} onHide={handleModalCloseManager}>
		  <ModalHeader closeButton>
			<ModalTitle>Managers</ModalTitle>
		  </ModalHeader>
		  <ModalBody>
			  <ListGroup as="ol" numbered>
			  {
				  manager_users.map(user=>{
					return user.role == 2 && user._id != userId && (
					  <ListGroup.Item
					  as="li"
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
		  </ModalBody>
		  <ModalFooter>
			<Button variant="secondary" onClick={handleModalCloseManager}>
			  Close
			</Button>
			<Button variant="primary" onClick={saveChanges}>
			  Save Changes
			</Button>
		  </ModalFooter>
	  </Modal>             
  </div>
  );
};

export default Users;
