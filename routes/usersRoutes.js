const express = require("express");
const router = express.Router();
const usersContriller = require("../controller/usersContriller");
const verifyJWT = require("../middleware/verifyJWT");



router.use(verifyJWT);
router.route("/").get(usersContriller.getAllUsers);

module.exports = router;
