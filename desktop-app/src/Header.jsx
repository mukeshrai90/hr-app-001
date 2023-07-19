
import { useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated, signout } from "./auth";
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import logo from "./logo.svg";

const Header = ({setIsLoading}) => {
  const { user } = isAuthenticated();
  
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleDrawer = () => {
      setIsOpen((prevState) => !prevState)	  
	  document.getElementById('navbar-toggle').classList.toggle("change");
  }
  
  const logout = ()=>{
      setIsLoading(true);
	  signout(()=>{
        setTimeout(()=>{
          window.location.reload()
        } , 300)
      })
  }
    
    
  return (
    <div class="header-sectn">
	  <div className="header">
		<img src={logo} alt="" width="30" height="20" style={{display:'inline-block', marginTop:-5+'px'}}/>
		<h5 style={{display:'inline-block'}}>HR - Leave Request App</h5>
	  </div>
	  
	  <div>
		
		{ isAuthenticated() ? <h5>{user.firstname} {user.lastname}</h5> : ''}
		
		{ isAuthenticated() ? <>
			<div style={{textAlign:'right',marginTop: -40+'px'}}>
				<button id="navbar-toggle" class="navbar-toggle" onClick={toggleDrawer}>
					<div class="bar1"></div>
					<div class="bar2"></div>
					<div class="bar3"></div>
				</button>
			</div>
			<Drawer
				open={isOpen}
				onClose={toggleDrawer}
				direction='right'
				className='bla bla bla'
			>
				
				<button class="navbar-toggle change" onClick={toggleDrawer}>
					<div class="bar1"></div>
					<div class="bar2"></div>
					<div class="bar3"></div>
				</button>
				
				<ul class="sidebar-ul">
				   
					<li>
						<button as="span" variant="outline-dark" style={{}} onClick={logout}>Logout</button>
					</li>
				</ul>
			</Drawer>
		  </> : ''
		}		
	  </div>
	</div>
  );
};

export default Header;