import { API } from "../Config";

export const getUsers = ( token, currentPage, role) => {
    return fetch(`${API}/users/?page=${currentPage}&role=${role}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((responce) => {
        return responce.json();
      })
  
      .catch((err) => {
        console.log(err);
      });
};
  
export const getManagerUsers = ( token) => {
    return fetch(`${API}/users/managers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((responce) => {
        return responce.json();
      })
  
      .catch((err) => {
        console.log(err);
      });
};
  
export const getUser = ( token , userId) => {
  return fetch(`${API}/users/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((responce) => {
      return responce.json();
    })

    .catch((err) => {
      console.log(err);
    });
};

export const updateUser = (user , userId, token) => {
  return fetch(`${API}/users/${userId}/update`, {
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

export const getUsersForFilter = (userId, token) => {
  return fetch(`${API}/users/users-list/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((responce) => {
      return responce.json();
    })

    .catch((err) => {
      console.log(err);
    });
};