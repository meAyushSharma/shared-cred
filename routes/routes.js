const path = require("path");
const express = require("express");
const passport = require("passport");
// const session = require('express-session');

require("../utils/passport");
const { userAuth } = require("../middleware/userAuth");
const userController = require('../controllers/userController');
const googleAuth = require('../controllers/googleAuth');
const resourceController = require('../controllers/resourceController');
const passkeyController = require('../controllers/passkeyController')
const catchAsync = require('../utils/catchAsync');
// const upload = require("../middleware/multerUpload");
const multerErrorHandler = require('../middleware/multerErrorHandler');
const router = express.Router();


// to use sessions for google auth
router.use(passport.initialize());
router.use(passport.session());

// to check if the user has previous session details
router.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// to serve static files
router.use(express.static(path.join(__dirname, "../client")));
router.use(express.static(path.join(__dirname, "../client", "login")));
router.use(express.static(path.join(__dirname, "../client", "main")));
router.use(express.static(path.join(__dirname, "../client", "signup")));



//signup and static routes: 
router.get("/", catchAsync(userController.sendStaticMain));
router.get("/signup", catchAsync(userController.sendStaticSignup));
router.post("/signup", catchAsync(userController.registerUser));
router.get("/login", catchAsync(userController.sendStaticLogin));
router.post("/login", catchAsync(userController.loginUser));
router.get("/logout", userAuth, userController.logoutUser);
router.get("/get-images", userAuth, catchAsync(userController.getImages));
router.post("/delete-cred-image", userAuth, catchAsync(userController.deleteImage));
router.get('/download-data', userAuth, catchAsync(userController.sendDataForDownload));
router.get('/delete-account', userAuth, catchAsync(userController.deleteAccount));
router.post('/reset-password', userAuth, catchAsync(userController.resetPassword));
router.get('/forgot-password', catchAsync(userController.sendForgotPassword));

router.post("/encrytption-info", userAuth, catchAsync(userController.getPublicKey));
router.post("/encrypted-symmetric-key-shared", userAuth, catchAsync(userController.getEncryptedSymmetricKey));
router.get('/check-public-key', userAuth, catchAsync(userController.checkPublicKey));
router.post('/set-public-key', userAuth, catchAsync(userController.setPublicKey))


// upload route
router.post("/upload", userAuth, catchAsync(multerErrorHandler.errHandle), catchAsync(userController.uploadCred));

// google auth0 routes
router.get("/auth/google", googleAuth.passportScope);
router.get("/auth/google/callback", googleAuth.passportAuthenticate);
router.get("/success",  googleAuth.googleAuthSuccess);
router.get("/failure", catchAsync(googleAuth.googleAuthFailure));

// passkey routes
router.post("/register-passkey", userAuth, catchAsync(passkeyController.generatePasskey));
router.post("/verify-passkey", userAuth, catchAsync(passkeyController.verifyPasskeyResult));
router.post("/login-passkey", catchAsync(passkeyController.loginPasskeyResult));
router.post("/verify-login-passkey", catchAsync(passkeyController.verifyLoginPasskeyResult));



// resource operations routes here:
router.post("/create-resource", userAuth, catchAsync(resourceController.createResource));
router.post("/delete-resource", userAuth, catchAsync(resourceController.deleteResource));
router.post("/add-user", userAuth, catchAsync(resourceController.addMemberToResource));
router.post("/edit-resource", userAuth, catchAsync(resourceController.editResource));

router.post("/encrypted-symmetric-key", userAuth, catchAsync(resourceController.getSymmetricKey));

router.get('/show-shared-resources', userAuth, catchAsync(resourceController.showSharedResources));
router.post('/show-resource-info', userAuth, catchAsync(resourceController.showResourceInfo));
router.post('/remove-resource-permission', userAuth, catchAsync(resourceController.removeResourcePermission));


module.exports = { router };
