import { API } from "../Config";

export const signup = (user , token) => {
    return fetch(`${API}/users/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(user),
    })
      .then((responce) => {
        return responce.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };


  export const signin = (user) => {
    return fetch(`${API}/users/signin`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(user),
    })
      .then((responce) => {
        return responce.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };


  export const authenticate = (data, next) => {

    if(typeof window !== "undefined"){
        localStorage.setItem('jwt',JSON.stringify(data))
        next()
    }
  }

  export const signout = (next) =>{

    if(typeof window !== "undefined"){
      localStorage.removeItem('jwt')
      next();
      return fetch(`${API}/users/signout`, {
        method  : "GET"
      }).then(responce =>{

        console.log("signout", responce)
      }).catch(err=>{
        console.log(err)
      })

    }
  }


  export const isAuthenticated = () =>{
    if(typeof window === undefined){
      return false;
    }
    if(localStorage.getItem("jwt")){
      return JSON.parse(localStorage.getItem("jwt"))
    }else{
      return false;
    }
  }
  
  export const authenticateEmail = (user) => {
    return fetch(`${API}/users/check-email`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(user),
    })
      .then((responce) => {
        return responce.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  export const authenticateOTP = (user) => {
    return fetch(`${API}/users/check-otp`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(user),
    })
      .then((responce) => {
        return responce.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  export const changePassword = (user) => {
    return fetch(`${API}/users/change-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(user),
    })
      .then((responce) => {
        return responce.json();
      })
      .catch((err) => {
        console.log(err);
      });
  };