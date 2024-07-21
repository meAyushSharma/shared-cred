const path = require("path");
const express = require("express");
const passport = require("passport");

require("../utils/passport");
const { userAuth } = require("../middleware/userAuth");
const userController = require('../controllers/userController');
const googleAuth = require('../controllers/googleAuth');
const resourceController = require('../controllers/resourceController');
const catchAsync = require('../utils/catchAsync');
const router = express.Router();


// to use sessions for google auth
router.use(passport.initialize());
router.use(passport.session());

// to serve static files
router.use(express.static(path.join(__dirname, "../client")));
router.use(express.static(path.join(__dirname, "../client", "main")));
router.use(express.static(path.join(__dirname, "../client", "signup")));



// to read body inputs and parse cookies
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true })); // not needed but just there.
// router.use(cookieParser());

//signup and static routes: 
router.get("/", catchAsync(userController.sendStaticMain));
router.get("/signup", catchAsync(userController.sendStaticSignup));
router.get("/auth/google", googleAuth.passportScope);
router.get("/auth/google/callback", googleAuth.passportAuthenticate);
router.get("/success", catchAsync(googleAuth.googleAuthSuccess));
router.get("/failure", catchAsync(googleAuth.googleAuthFailure));
router.post("/signup", catchAsync(userController.registerUser));
router.post("/login", catchAsync(userController.loginUser));
router.get("/logout", userAuth, userController.logoutUser);


// resource operations routes here:
router.post("/create-resource", userAuth, catchAsync(resourceController.createResource));
router.post("/delete-resource", userAuth, catchAsync(resourceController.deleteResource));
router.post("/add-user", userAuth, catchAsync(resourceController.addMemberToResource));
router.post("/edit-resource", userAuth, catchAsync(resourceController.editResource));

module.exports = { router };
