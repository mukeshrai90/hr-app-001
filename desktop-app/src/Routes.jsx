import { Router, Route } from "electron-router-dom";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Login from "./screens/login";
import Home from "./screens/home";
import NewRequest from "./screens/newrequest";
import Requests from "./screens/requests";
import NewUser from "./screens/newuser";
import Users from "./screens/users";
import ForgotPassword from "./screens/forgotPassword";
import { isAuthenticated, signout } from "./auth";

const AppRoutes = ({setIsLoading}) => {
	
  return (

      <Router
        main={
          <>
		    <Route path="/" 
			  element={<Login setIsLoading = {setIsLoading} />} />

            <Route path="/home"
              element={isAuthenticated() ? <Home setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />

            <Route path="/request/new"
              element={isAuthenticated() ? <NewRequest setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />
			
			<Route path="/requests/:type/:state"
              element={isAuthenticated() ? <Requests setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />
			
			<Route path="/requests/:type"
              element={isAuthenticated() ? <Requests setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />

		    <Route path="/user/new"
              element={isAuthenticated() ? <NewUser setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />

			<Route path="/users"
              element={isAuthenticated() ? <Users setIsLoading = {setIsLoading} /> : <Navigate to="/" />}
            />
			
			<Route path="/forgot-password"
              element={<ForgotPassword setIsLoading = {setIsLoading} />}
            />
          </>
        }
      />
  );
};

export default AppRoutes;
