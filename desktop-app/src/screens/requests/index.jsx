import React, { useEffect, useState  } from "react";
import {useParams, useNavigate, Link} from "react-router-dom"
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { deleteRequest, getRequests  , changeStateRequest } from "../../api/request";
import { getUsersForFilter } from "../../api/user";
import moment from "moment";
import { isAuthenticated } from "../../auth";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Modal from '../../utils/Model';
import ModalTitle from '../../utils/ModalTitle';
import ModalHeader from "../../utils/ModalHeader"
import ModalBody from '../../utils/ModalBody';
import ModalFooter from '../../utils/ModalFooter';
import Pagination from '../../utils/Pagination/Pagination';

const Requests = ({setIsLoading}) => {
  
  const { user, token } = isAuthenticated();
  
  let { type, state } = useParams();
 
  const [requests, setRequests] = useState([]);
  
  const [reqState, setReqState] = useState(state);
  
  const [currentPage, setCurrentPage] = useState(1);  
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(0);
  
  const [usersForFilter, setUsersForFilter] = React.useState([]);
  const [user_filter, setUserFilter] = React.useState('');
  
  const [showReasonModal, setShowReasonModal] = React.useState(false);
  
  const [request, setRequest] = React.useState({});
  const [changedState, setChangedState] = React.useState('');
  
  const [values, setValues] = React.useState({
	  reason: '',
	  errors: {
        reason: '',
      }
  });
  
  const {reason, errors}= values;
  
  const handleChange = (name) => (event) => {
	const value = event.target?.value;
	errors.reason = '';
    if(name == 'reason'){
		if(value == '' || value.length < 5){
			errors.reason = 'Reason must be atleast 5 characters long.'
		}
	}
	
	setValues({ ...values, errors: errors, [name]: value });
  };
  
  const filterRequestsByUser = (event) => {setUserFilter(event.target?.value);}

  useEffect(() => {
	getRequestsData();
  }, [reqState, currentPage, user_filter]);
  
  useEffect(() => {
	setIsLoading(true);
	getUsersForFilter(user._id, token).then((response) => {
	  setIsLoading(false);
	  if (response.status) {
		  setUsersForFilter(response.data);
	  } else {
		console.log("🚀 ~ file: requests/index.jsx:44 ~ getRequestsData ~ data:", response)
	  }
	}).catch((err) => {
	   console.log("🚀 ~ file: requests/index.jsx:47 ~ getRequestsData ~ data:", err)
	});
  }, []);
  
  const getRequestsData = () => {
	if((type != 'approvals') || (type == 'approvals' && reqState != '' && reqState != undefined && reqState != 'all')){
		setIsLoading(true);
		getRequests(user._id , user.role, token, type, reqState, currentPage, user_filter).then((response) => {
		  setIsLoading(false);
		  if (response.status) {
			  setRequests(response.data.requests);
			  setTotalCount(response.data.totalCount);
			  setPerPage(response.data.perPage);
		  } else {
			console.log("🚀 ~ file: requests/index.jsx:41 ~ getRequestsData ~ data:", response)
		  }
		}).catch((err) => {
		   console.log("🚀 ~ file: requests/index.jsx:44 ~ getRequestsData ~ data:", err)
		});
	}
  }
  
  const _delete = (request) => {
	setIsLoading(true);
    deleteRequest(request, token).then((response) => {
	  setIsLoading(false);
      if (response.status) {
		setIsLoading(true);
        getRequests(user._id,  user.role, token, type, reqState, currentPage).then((response) => {
		  setIsLoading(false);
          if (response.status) {
              setRequests(response.data.requests);
			  setTotalCount(response.data.totalCount);
			  setPerPage(response.data.perPage);
          } else {
            console.log("🚀 ~ file: requests/index.jsx:51 ~ _delete ~ data:", response)
          }
        });
      } else {
        console.log("🚀 ~ file: requests/index.jsx:55 ~ _delete ~ data:", response)
      }
    });
  };
  
  const changeState = (request , state) => {
	setValues({ ...values, errors: {reason: ''}, reason: '' });
	setRequest(request)
	setChangedState(state)
	setShowReasonModal(true)
	window.scrollTo(0,0);
  }
  
  const handleReasonModalClose = () => setShowReasonModal(false);

  const changeStateSubmit = () => {
	
	errors.reason = '';
	if(reason == '' || reason.length < 5){
		errors.reason = 'Reason must be atleast 5 characters long.';
	}
	
	let valid = true;
    Object.values(errors).forEach(val => val.length > 0 && (valid = false));
  
    if(!valid){
	  setValues({ ...values, errors: errors });
	  console.error('Invalid Form');
	  return false;
    }
	  
	setIsLoading(true);
	changeStateRequest(request , changedState, token, reason).then((response) => { 
      setIsLoading(false);	
      if (response.status) {
		setShowReasonModal(false)
		setIsLoading(true);
        getRequests(user._id, user.role, token, type, reqState, currentPage).then((response) => {
		  setIsLoading(false);
          if (response.status) {
			  setRequests(response.data.requests);
			  setTotalCount(response.data.totalCount);
			  setPerPage(response.data.perPage);
          } else {
            console.log("🚀 ~ file: requests/index.jsx:71 ~ changeState ~ data:", response)
          }
        });		
      } else {
        console.log("🚀 ~ file: requests/index.jsx:75 ~ changeState ~ data:", response)
      }
    });
  }
  
  const setApprovalsAction = (state) => {
	setReqState(state);	
	setCurrentPage(1);	
  }
  
  const _showDateFormat = (date) => {
	 return moment(date).format('DD-MM-YYYY');
  }
  
  const getCurrentDate = () => {
	 return new Date();
  }
  
  const isAllowedDate = (start_date) => {
	return moment(start_date).isSameOrAfter(getCurrentDate(), 'day')
  }
  
  return (
    <div>
	  <div style={{marginBottom:30+'px',marginTop:5+'px', textAlign:'right'}}>
		<Link to="/home" style={{color:'#212529'}}>Back to Dashboard</Link>
	  </div>
   
	 {type === "pending"  && <>   <h1 className="text-center">Pending Leave Requests</h1>
	 
	 {
		 user.role === 0 ? <>
			 <Form.Select aria-label="Select Role" onChange={filterRequestsByUser} style={{marginBottom: 20+'px'}}>
				  <option disabled>Select User to filter</option>
				  <option value="">All</option>
				  {
					usersForFilter.map((record, index) => {
						return <option key={record._id} value={record._id} >
							{record.firstname} {record.lastname}
						</option>
					})
				  }
			  </Form.Select>
		  </> : ''
	 }
     
     <div className="requests-list">
		<Accordion defaultActiveKey="0">
			{requests.filter(request=>request.state === "pending"|| request.state === "canceled").length > 0 ?<>{requests.filter(request=>request.state === "pending"|| request.state === "canceled").map((request, index) => {
          return (
            <Accordion.Item eventKey={index} key={request._id}>
              <Accordion.Header ><span className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>Request {index + 1 + (perPage*(currentPage-1))}  <b className="m-1">({request.state})</b></span></Accordion.Header>
              <Accordion.Body className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>
                <Row>
                {user.role == 0 && <>
                
                  <Col sm="12">
                    Firstname: <b>{request.userId.firstname}</b>
                  </Col>
                  <Col sm="12">
                    LastNmae: <b>{request.userId.lastname}</b>
                  </Col>
                  <Col sm="12">
                    Email: <b>{request.userId.email}</b>
                  </Col>
                </>}

                  <Col sm="12">
                    <b>Start Date</b>: {_showDateFormat(request.start_date)}
                  </Col>
                  <Col sm="12">
                    <b>End Date</b>: {_showDateFormat(request.end_date)}
                  </Col>

                  <Col sm="12">
                    <b>Type</b>: {request.request_type}
                  </Col>
                  <Col sm="12">
                    <b>State</b>: {request.state}
                  </Col>
				  <Col sm="12">
                      <b>Reason</b>
                      <br />
                      {request.reason}
                  </Col>

                  <Col sm="5" className="mt-1"></Col>
                  {
				   (user.role == 1 || user.role == 2) ?  
				     <Col sm="7" className="mt-1 text-end">
                     {
						 (request.state !== "canceled" && isAllowedDate(request.start_date)) ? (
						  <Button
							variant="warning"
							className="mx-1"
							onClick={() => _delete(request)}
						  >
							Delete
						  </Button>
                       ) : ''
					 }
                    </Col> : <> 
				     { 
						isAllowedDate(request.start_date) ? (				  
						  <Col sm="7" className="mt-1 text-end">
							<Button variant="danger"   onClick={() => changeState(request , "rejected")}>
							  Reject
							</Button>

							<Button variant="success" className="mx-1"   onClick={() => changeState(request , "approved")}>
							  Approve
							</Button>					   
						  </Col>
				        ) : ''
					 }
					 </> 
				  }
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}</> : <h5 className="text-center text-muted"> No Requests</h5>}
      </Accordion>
	</div>
	{
		requests.length ? <>
		<Pagination
			className="pagination-bar"
			currentPage={currentPage}
			totalCount={totalCount}
			pageSize={perPage}
			onPageChange={page => setCurrentPage(page)}
		 />
		</> : '' 
	}
</>}
   {
     type === "completed" && <>

     {/* ----------------------------------------------------------- */}

     <h1 className="text-center">Completed Leave Requests</h1>
	 
	 {
		 user.role === 0 ? <>
			 <Form.Select aria-label="Select Role" onChange={filterRequestsByUser} style={{marginBottom: 20+'px'}}>
				  <option disabled>Select User to filter</option>
				  <option value="">All</option>
				  {
					usersForFilter.map((record, index) => {
						return <option key={record._id} value={record._id} >
							{record.firstname} {record.lastname}
						</option>
					})
				  }
			  </Form.Select>
		  </> : ''
	 }
     
     <div className="requests-list">
		<Accordion defaultActiveKey="0">
			{requests.filter(request=>request.state === "rejected"|| request.state === "approved").length > 0 ? <>{requests.filter(request=>request.state === 	"rejected"|| request.state === "approved").map((request, index) => {
			  return (
				<Accordion.Item eventKey={index} key={request._id}>
				  <Accordion.Header ><span className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>Request {index + 1 + (perPage*(currentPage-1))}  <b className="m-1">({request.state})</b></span></Accordion.Header>
				  <Accordion.Body className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>
					<Row>					  
					  {
						  user.role == 0 && <>                
							 <Col sm="12">
								Firstname: <b>{request.userId.firstname}</b>
							  </Col>
							  <Col sm="12">
								LastNmae: <b>{request.userId.lastname}</b>
							  </Col>
							  <Col sm="12">
								Email: <b>{request.userId.email}</b>
							  </Col>
						  </>
				      }
					  
					  <Col sm="12">
						<b>Start Date</b>: {_showDateFormat(request.start_date)}
					  </Col>
					  <Col sm="12">
						<b>End Date</b>: {_showDateFormat(request.end_date)}
					  </Col>

					  <Col sm="12">
						<b>Type</b>: {request.request_type}
					  </Col>
					  <Col sm="12">
						<b>State</b>: {request.state}
					  </Col>
					  <Col sm="12">
						  <b>Reason: </b>
						  <br />
						  {request.reason}
					  </Col>
					  <Col sm="12">
						  <b>Comment: </b>
						  <br />
						  {request?.comment}
					  </Col>

					  <Col sm="5" className="mt-1"></Col>
					  {
						  (user.role == 1 || user.role == 2) &&
						    <Col sm="7" className="mt-1 text-end">
						    {
							  (request.state !== "rejected" && isAllowedDate(request.start_date)) ? (
							  <Button
								variant="warning"
								className="mx-1"
								onClick={() => changeState(request , "canceled")}
							  >
								Cancel Leave
							  </Button>
							  ) : ''
						    }
						   </Col> 
					  }
					</Row>
				  </Accordion.Body>
				</Accordion.Item>
			  );
        })}</> : <h5 className="text-center text-muted"> No Requests</h5>}
      </Accordion>
     </div>
	 {
		requests.length ? <>
		<Pagination
			className="pagination-bar"
			currentPage={currentPage}
			totalCount={totalCount}
			pageSize={perPage}
			onPageChange={page => setCurrentPage(page)}
		 />
		</> : '' 
	 }
</>
   }

   {type === "approvals" && <>   <h1 className="text-center">Approvals</h1>
     
     <div style={{marginBottom:20+'px'}}>
		<button className={`${reqState === "pending" ? "activBtn" : ""}`} style={{marginRight: 20+'px',border: "none",padding: 4+'px '+10+'px'}}  onClick={() => setApprovalsAction("pending")}>Pending Requests</button>
		<button className={`${reqState === "approved" ? "activBtn" : ""}`} style={{border: "none",padding: 4+'px '+10+'px'}}  onClick={() => setApprovalsAction("approved")}>Approved Requests</button>
	 </div>
	 
	 {
		 (user.role === 0 || user.role === 2) ? <>
			 <Form.Select aria-label="Select Role" onChange={filterRequestsByUser} style={{marginBottom: 20+'px'}}>
				  <option disabled>Select User to filter</option>
				  <option value="">All</option>
				  {
					usersForFilter.map((record, index) => {
						return <option key={record._id} value={record._id} >
							{record.firstname} {record.lastname}
						</option>
					})
				  }
			  </Form.Select>
		  </> : ''
	 }
	 
	 <div className="requests-list">        
	 
	 {(reqState != undefined && reqState != '' && reqState != 'all') ? <>
		 <Accordion defaultActiveKey="0">
			{requests.filter(request=>request.state === "approved" || request.state === "canceled" || request.state === "pending").length > 0 ? <> {requests.filter(request=>request.state === "approved" || request.state === "canceled" || request.state === "pending").map((request, index) => {
			  return (
				<Accordion.Item eventKey={index} key={request._id}>
				  <Accordion.Header ><span className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>Request {index + 1 + (perPage*(currentPage-1))}  <b className="m-1">({request.state})</b></span></Accordion.Header>
				  <Accordion.Body className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>
					<Row>
					  {
						  (user.role == 0 || user.role == 2) && <>
                
							 <Col sm="12">
								Firstname: <b>{request.userId.firstname}</b>
							  </Col>
							  <Col sm="12">
								LastNmae: <b>{request.userId.lastname}</b>
							  </Col>
							  <Col sm="12">
								Email: <b>{request.userId.email}</b>
							  </Col>
						  </>
				      }
					  <Col sm="12">
						<b>Start Date</b>: {_showDateFormat(request.start_date)}
					  </Col>
					  <Col sm="12">
						<b>End Date</b>: {_showDateFormat(request.end_date)}
					  </Col>

					  <Col sm="12">
						<b>Type</b>: {request.request_type}
					  </Col>
					  <Col sm="12">
						<b>State</b>: {request.state}
					  </Col>
					  <Col sm="12">
						  <b>Reason:</b>
						  <br />
						  {request.reason}
					  </Col>
					  {
						  request.state != "pending" ? (
							  <Col sm="12">
								  <b>Comment: </b>
								  <br />
								  {request?.comment}
							  </Col>
						  ) : ''
					  }

					  <Col sm="5" className="mt-1"></Col>
					  {
						 ((user.role == 2 || user.role == 0) && (request.state === "pending" || request.state === "approved")) &&  
							<Col sm="7" className="mt-1 text-end">
							{
								(request.state === "pending" && isAllowedDate(request.start_date)) ? (
								<>
									<Button variant="danger"   onClick={() => changeState(request , "rejected")}>
									  Reject
									</Button>

									<Button variant="success" className="mx-1"   onClick={() => changeState(request , "approved")}>
									  Approve
									</Button>
								</>
							   ) : (
								  ''
							  )
							}
						   </Col>
					   }
					</Row>
				  </Accordion.Body>
				</Accordion.Item>
			  );
			})} </> : <h5 className="text-center text-muted"> No Requests</h5>}
		  </Accordion>
		  </> : ''}
     </div>
	 {
		requests.length ? <>
		<Pagination
			className="pagination-bar"
			currentPage={currentPage}
			totalCount={totalCount}
			pageSize={perPage}
			onPageChange={page => setCurrentPage(page)}
		 />
		</> : '' 
	 }
</>}

        <Modal show={showReasonModal} onHide={handleReasonModalClose}>
		  <ModalBody>
			  <Card className="p-1 mb-1">
				<Form.Group className="mb-3" controlId="formBasicPassword">
				  <Form.Label>
					Reason/Comments <span className="text-muted">(*)</span>
				  </Form.Label>
				  <Form.Control
					placeholder="Enter Reason/Comments"
					value={reason}
					onChange={handleChange("reason")}
					as="textarea"
					rows={3}
				  />
				  {errors.reason.length > 0 && 
					<span className='spn-error'>{errors.reason}</span>}
				</Form.Group>
			  </Card>			
		  </ModalBody>
		  <ModalFooter>
			<Button variant="primary" onClick={changeStateSubmit}>
			  Submit
			</Button>
			<Button variant="secondary" onClick={handleReasonModalClose}>
			  Close
			</Button>
		  </ModalFooter>
	  </Modal>  

    </div>
  );
};

export default Requests;
