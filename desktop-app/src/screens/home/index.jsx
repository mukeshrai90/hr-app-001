import React from 'react'
import {useNavigate} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import {isAuthenticated, signout} from "../../auth"
import { cap, role } from '../../utils';

const Home = ({setIsLoading}) => {
  const { user } = isAuthenticated();
    const navigate = useNavigate()
    const logout = ()=>{
      setIsLoading(true);
	  signout(()=>{
		setIsLoading(false);
        setTimeout(()=>{
          window.location.reload()
        } , 300)
      })

    }
    
    
  return (
    <>
       
        <div className="buttons">
            {
				(user.role === 1 || user.role === 2) ?                         
				 <>				   
				   <button  onClick={() => navigate("/request/new")}>New Leave Request</button> 				   				   
				 </>  : ''			
			}
			{
				user.role === 0 ? 
				<>				
					<button  onClick={() => navigate("/user/new")}>New User</button>
					<button  onClick={() => navigate("/users")}>Users List</button> 
				</> : ''		
			}
			
			<button  onClick={() => navigate("/requests/pending/all")}>Pending Requests</button>
			<button  onClick={() => navigate("/requests/completed/all")}>Completed Requests</button>
			
			{
				(user.role === 0 || user.role === 2) ?
				<>
					<button onClick={() => navigate("/requests/approvals/pending")}>Approvals</button>
				</> : ''
			}
        </div>
    </>          
   
  )
}

export default Home