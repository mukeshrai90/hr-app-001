import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { isAuthenticated } from "../../auth";
import moment from "moment";

import Button from "react-bootstrap/Button";
import { Alert, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { createRequest } from "../../api/request";
import { Link } from "react-router-dom";

const NewRequest = ({setIsLoading}) => {
  const navigate = useNavigate();

  const { user, token } = isAuthenticated();
  
  const { firstname, lastname, email } = user;
  
  const [values, setValues] = useState({
    start_date: moment().format("YYYY-MM-DD"),
    end_date: moment().format("YYYY-MM-DD"),
    request_type: "",
    reason: "",

    success: false,
    error: false,
	errors: {
        start_date: '',
        end_date: '',
        reason: '',
        request_type: '',
    }
  });

  const { start_date, end_date, request_type, reason, error, success, errors } = values;
  
  const cap =  (str)=>str[0].toUpperCase() + str.substring(1) ; 
  
  function validateFrm(name, value){
	  
	  switch (name) {
		  case 'start_date': 
			  errors.start_date = '';
			  if(value.length){
				  let start_date = moment(value);
				  if(start_date.isBefore(new Date(), 'day')){
					  errors.start_date = 'Start date must be greater than or equal to today';
				  }
			  } else {
				  errors.start_date = 'Start date is required';
			  }
			break;
		  case 'end_date': 
			  errors.end_date = '';
			  if(value.length){
				  let end_date = moment(value);
				  let start_date_tmp = moment(start_date);
				  if(end_date.isBefore(new Date(), 'day')){
					  errors.end_date = 'End date must be greater than or equal to today';
				  } else if(end_date.isSameOrAfter(start_date_tmp, 'day')){
					  
				  } else {
					  errors.end_date = 'End date must be greater than or equal to Start Date';
				  }
			  } else {
				  errors.end_date = 'End date is required';
			  }
			break;
		  case 'request_type': 
			errors.request_type = 
			  value.length < 1
				? 'Request type is required!'
				: '';
			break;
		  case 'reason': 
			errors.reason = 
			  value.length < 10
				? 'Reason must be at least 10 characters long!'
				: '';
			break;
		  default:
			break;
      }
  }

  const handleChange = (name) => (event) => {
    // setValues({ ...values, error: false, [name]: event.target.value });
	
	const value = event.target?.value;

    validateFrm(name, value);
	
	setValues({ ...values, errors: errors, [name]: value });
	
  };
  
  const validateFormSbmt = errors => {
	  
	  validateFrm('start_date', start_date);
	  validateFrm('end_date', end_date);
	  validateFrm('request_type', request_type);
	  validateFrm('reason', reason);
	  
	  let valid = true;
	  Object.values(errors).forEach(val => val.length > 0 && (valid = false));
	  
	  if(!valid){
		  setValues({ ...values, errors: errors });
	  }
	  return valid;
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
	
	if(!validateFormSbmt(errors)) {
      console.error('Invalid Form');
	  return false;
    }

    setValues({ ...values, error: false });
    
	setIsLoading(true);
    createRequest(
      { start_date, end_date, request_type, reason },
      token,
      user._id
    ).then((response) => {
      setIsLoading(false);
	  console.log("🚀 ~ file: newrequest/index.jsx:133 ~ createRequest ~ data:", response)
	  if (response.status) {
		window.scrollTo(0,0);
		setValues({
          start_date: moment().format("YYYY-MM-DD"),
          end_date: moment().format("YYYY-MM-DD"),
          reason: "",

          success: true,
          error: false,
		  errors: {
			start_date: '',
			end_date: '',
			reason: '',
			request_type: "",
		  }
        });
        
      } else {
		window.scrollTo(0,0);
        setValues({
          ...values,
          error: response.error || response.err || "Please check the required fields",
          success: false,
        });
      }
    });
  };
  
  const reset = () => {
    setValues({
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      reason: "",

      success: false,
      error: false,
	  errors: {
        start_date: '',
        end_date: '',
        reason: '',
        request_type: '',
      }	  
    });
  };
  
  return (
    <div>
	  <div style={{marginBottom:30+'px',marginTop:5+'px', textAlign:'right'}}>
		<Link to="/home" style={{color:'#212529'}}>Back to Dashboard</Link>
	  </div>
	  
	  <h1 className="text-center">New Leave Request</h1>
      <Form onSubmit={handleSubmit}>
        <div class="new-reqst-msg">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Request added</Alert>}
        </div>
        <Card className="p-1 mb-1">
          <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Form.Label column sm="4">
              Start Date
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="date"
                value={start_date}
                onChange={handleChange("start_date")}
              />
			  {errors.start_date.length > 0 && 
                <span className='spn-error'>{errors.start_date}</span>}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Form.Label column sm="4">
              End Date
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="date"
                value={end_date}
                onChange={handleChange("end_date")}
              />
			  {errors.end_date.length > 0 && 
                <span className='spn-error'>{errors.end_date}</span>}
            </Col>
          </Form.Group>
        </Card>
        <Card className="p-1 mb-1">
          <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Col sm="12">
              <Form.Label>
                REQUEST TYPE <span className="text-muted">(*)</span>
              </Form.Label>
            </Col>
		  </Form.Group>
          
		  <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Col sm="12">
              <Form.Label>Vacation</Form.Label>
			  <Form.Check
                name="request_type"
                onChange={handleChange("request_type")}
                value={"Vacation"}
                type="radio"
                label=""
              />
            </Col>
		  </Form.Group>
		  <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
            <Col sm="12">
              <Form.Label>Wellness</Form.Label>
			  <Form.Check
                name="request_type"
                onChange={handleChange("request_type")}
                value={"Wellness"}
                type="radio"
                label=""
              />
            </Col>
          </Form.Group>
		  {errors.request_type.length > 0 && 
                <span className='spn-error'>{errors.request_type}</span>}
        </Card>
		
		<Card className="p-1 mb-1">
			<Form.Group className="mb-3" controlId="formBasicPassword">
			  <Form.Label>
				REASON FOR REQUEST <span className="text-muted">(*)</span>
			  </Form.Label>
			  <Form.Control
				placeholder="REASON FOR REQUEST"
				value={reason}
				onChange={handleChange("reason")}
				as="textarea"
				rows={3}
			  />
			  {errors.reason.length > 0 && 
                <span className='spn-error'>{errors.reason}</span>}
			</Form.Group>
		</Card>

        <div className="d-grid gap-2">
          <Button className="mb-3" variant="primary" type="submit" size="md">
            Submit
          </Button>
		  
		  <Button variant="secondary" type="button" onClick={reset} size="md">
            Reset
          </Button>
		  
          <Button variant="danger" onClick={() => navigate("/home")} size="md">
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default NewRequest;
