const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require("../utils/ExpressError");
const jwt = require('jsonwebtoken');
const { User } = require("../models/schema");
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse} = require("@simplewebauthn/server");


    // rpID: "credential-manager-cdl1.onrender.com",
module.exports.generatePasskey = async (req, res) => {
    console.log("at generate passkey")
    const challengePayLoad = await generateRegistrationOptions({
      rpID: "localhost",
      rpName: "My machine",
      userName: req.userDetails.username,
    });
    const user = await User.findOneAndUpdate(
      { _id: req.userDetails._id },
      { passkeyChallenge: challengePayLoad.challenge },
      { new: true }
    );
    // console.log("challenge is: ", challengePayLoad.challenge);
    res.json({
      options: challengePayLoad,
      msg: `this is the challenge generated: ${challengePayLoad.challenge}`,
    });
  };
  
  module.exports.verifyPasskeyResult = async (req, res) => {
    console.log("at verifypasskeyresult passkey")
    const { cred } = req.body;

    const user = await User.findOne({ _id: req.userDetails._id });
    if(!user) throw new ExpressError(`user not found:`, 400);
    const challenge = user.passkeyChallenge;
    // expectedOrigin: "https://credential-manager-cdl1.onrender.com",
    // expectedRPID: "credential-manager-cdl1.onrender.com",
    const verificationResult = await verifyRegistrationResponse({
      expectedChallenge: challenge,
      expectedOrigin: "http://localhost:3005",
      expectedRPID: "localhost",
      response: cred,
    });
    if (!verificationResult.verified)
      return res.json({ msg: "Error, could not verify the passkey ＞︿＜" });

    user.passkey = verificationResult.registrationInfo;
    user.save();
    return res.json({
      verified: true,
    });
  };
  
  module.exports.loginPasskeyResult = async (req, res) => {
    console.log("at loginpasskeyresult passkey")
    const response = await isTokenAndValid(req, res);
    if (response != null) {
      console.log("user logged while passkey login through token successfully! ", response);
      return res.redirect(200, "/credential-manager");
    }
    // rpID: "credential-manager-cdl1.onrender.com",
    const { username } = req.body;
    const loginChallengePayload = await generateAuthenticationOptions({
      rpID: "localhost",
    });
    const user = await User.findOneAndUpdate(
      { username : username },
      { loginPasskeyChallenge: loginChallengePayload.challenge },
      { new: true }
    );
    return res.json({
      options: loginChallengePayload,
      msg: `this is the login challenge generated: ${loginChallengePayload.challenge}`,
    });
  };
  
  module.exports.verifyLoginPasskeyResult = async (req, res) => {
    console.log("at verifyloginpasskeyresult passkey")
    const { cred, username } = req.body;
    const user = await User.findOne({ username: username });
    // expectedOrigin: "https://credential-manager-cdl1.onrender.com",
    // expectedRPID: "credential-manager-cdl1.onrender.com",
    if(!user) throw new ExpressError(`user not found:`, 400);
    const verificationResult = await verifyAuthenticationResponse({
        expectedChallenge: user.loginPasskeyChallenge,
        expectedOrigin: "http://localhost:3005",
        expectedRPID: "localhost",
        response: cred,
        authenticator:{
          credentialID: user.passkey.credentialID,
          credentialPublicKey: new Uint8Array(user.passkey.credentialPublicKey.buffer,),
          counter:user.passkey.counter,
          credentialType: user.passkey.credentialType,
          userVerified: user.passkey.userVerified,
          origin: user.passkey.origin,
          rpID: user.passkey.rpID
        }
      }); 
        if(!verificationResult.verified) return res.json({
          msg: "Not verified for some reason"
        })
        const passkeyToken = jwt.sign({username : username, name : user.name}, process.env.JWT_SECRET_KEY);
        res.cookie("passkeyToken", passkeyToken, {
            maxAge: 3 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            path: '/',
          });
          console.log("saved cookies")
        res.status(200).json({
            verified: true,
        })
}