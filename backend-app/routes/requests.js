const express = require("express");
const router = express.Router();


const {create, getAllRequestByUserId , deleteRequest  , updateRequestState} = require("../controllers/request")
const {requireSignin} = require("../controllers/user")



router.post("/new/:userId",requireSignin, create);
router.get("/:userId/:role/:type/:state",requireSignin, getAllRequestByUserId);
router.get("/delete/:id",requireSignin, deleteRequest);
router.put("/update/state/:id/:state",requireSignin, updateRequestState);


module.exports = router;