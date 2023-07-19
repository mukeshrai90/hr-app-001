import React, { useEffect, useState  } from "react";
import {useParams, useNavigate, Link} from "react-router-dom"
import Accordion from "react-bootstrap/Accordion";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import { deleteRequest, getRequests  , changeStateRequest } from "../../api/request";
import moment from "moment";
import { isAuthenticated } from "../../auth";
import { Button } from "react-bootstrap";
import Pagination from '../../utils/Pagination/Pagination';

const Requests = ({setIsLoading}) => {
  
  const { user, token } = isAuthenticated();
  
  let { type, state } = useParams();
 
  const [requests, setRequests] = useState([]);
  
  const [reqState, setReqState] = useState(state);
  
  const [currentPage, setCurrentPage] = useState(1);  
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(0);

  useEffect(() => {
	getRequestsData();
  }, [reqState, currentPage]);
  
  const getRequestsData = () => {
	if((type != 'approvals') || (type == 'approvals' && reqState != '' && reqState != undefined && reqState != 'all')){
		setIsLoading(true);
		getRequests(user._id , user.role, token, type, reqState, currentPage).then((response) => {
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
	setIsLoading(true);
	changeStateRequest(request , state, token).then((response) => { 
      setIsLoading(false);	
      if (response.status) {
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
     
     <div className="requests-list">
		<Accordion defaultActiveKey="0">
			{requests.filter(request=>request.state === "rejected"|| request.state === "approved").length > 0 ? <>{requests.filter(request=>request.state === 	"rejected"|| request.state === "approved").map((request, index) => {
			  return (
				<Accordion.Item eventKey={index} key={request._id}>
				  <Accordion.Header ><span className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>Request {index + 1}  <b className="m-1">({request.state})</b></span></Accordion.Header>
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
	 <div className="requests-list">        
	 
	 {(reqState != undefined && reqState != '' && reqState != 'all') ? <>
		 <Accordion defaultActiveKey="0">
			{requests.filter(request=>request.state === "approved" || request.state === "canceled" || request.state === "pending").length > 0 ? <> {requests.filter(request=>request.state === "approved" || request.state === "canceled" || request.state === "pending").map((request, index) => {
			  return (
				<Accordion.Item eventKey={index} key={request._id}>
				  <Accordion.Header ><span className={`${request.state === "canceled" ? "text-muted-2" : ""}`}>Request {index + 1}  <b className="m-1">({request.state})</b></span></Accordion.Header>
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


    </div>
  );
};

export default Requests;
