import { API } from "../Config";

export const createRequest = (request, token, userId) => {
  return fetch(`${API}/requests/new/${userId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(request, token),
  })
    .then((responce) => {
      return responce.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const deleteRequest = (request, token) => {
  console.log(request)
  return fetch(`${API}/requests/delete/${request._id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  })
    .then((responce) => {
      return responce.json();
    })
    .catch((err) => {
      console.log(err);
    });
};


export const changeStateRequest = (request , state, token) => {
  return fetch(`${API}/requests/update/state/${request._id}/${state}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  })
    .then((responce) => {
      return responce.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getRequests = (userId , role, token, type, state, currentPage) => {
  return fetch(`${API}/requests/${userId}/${role}/${type}/${state}?page=${currentPage}`, {
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
