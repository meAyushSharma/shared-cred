const { isTokenAndValid } = require("../utils/catchToken");
const ExpressError = require("../utils/ExpressError");
const jwt = require("jsonwebtoken");
const { User } = require("../models/schema");

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

/**
 * ============================
 * PASSKEY REGISTRATION
 * ============================
 */

module.exports.generatePasskey = async (req, res) => {
  console.log("at generatePasskey");

  const options = await generateRegistrationOptions({
    rpID: "cred.byayush.com",
    // rpID: "localhost",
    rpName: "Credential Manager",

    userID: Buffer.from(req.userDetails._id.toString()),
    userName: req.userDetails.username,

    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  await User.findByIdAndUpdate(req.userDetails._id, {
    passkeyChallenge: options.challenge,
  });

  res.json({ options });
};

module.exports.verifyPasskeyResult = async (req, res) => {
  console.log("at verifyPasskeyResult");

  try {
    const { cred } = req.body;
    const user = await User.findById(req.userDetails._id);

    if (!user) {
      return res.status(400).json({ verified: false, error: "User not found" });
    }

    const verification = await verifyRegistrationResponse({
      response: cred,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: "http://cred.byayush.com",
      expectedRPID: "cred.byayush.com",
    });

    if (!verification.verified) {
      return res.status(400).json({ verified: false, error: "Registration verification failed" });
    }

    const { registrationInfo } = verification;

    // 🔐 CRITICAL: store RAW BYTES, not string representations
    const credentialID = Buffer.isBuffer(registrationInfo.credentialID)
      ? registrationInfo.credentialID
      : Buffer.from(registrationInfo.credentialID, "base64url");

    const credentialPublicKey = Buffer.isBuffer(registrationInfo.credentialPublicKey)
      ? registrationInfo.credentialPublicKey
      : Buffer.from(registrationInfo.credentialPublicKey);

    // Initialize array if missing
    user.passkeys = user.passkeys || [];

    user.passkeys.push({
      credentialID,
      credentialPublicKey,
      counter: registrationInfo.counter,
      credentialType: registrationInfo.credentialType,
      userVerified: registrationInfo.userVerified,
      rpID: registrationInfo.rpID,
    });

    user.passkeyChallenge = undefined;
    await user.save();

    console.log("✅ Passkey registered successfully");
    console.log("   credentialID (hex):", credentialID.toString("hex"));
    console.log("   credentialID length:", credentialID.length);

    return res.json({ verified: true });
  } catch (err) {
    console.error("🔥 Passkey registration error:", err);
    return res.status(500).json({
      verified: false,
      error: "Internal passkey registration error",
    });
  }
};


/**
 * ============================
 * PASSKEY LOGIN (DISCOVERABLE)
 * ============================
 */

module.exports.loginPasskeyResult = async (req, res) => {
  console.log("at loginPasskeyResult");

  const tokenResult = await isTokenAndValid(req, res);
  if (tokenResult) {
    return res.redirect("/");
  }

  const options = await generateAuthenticationOptions({
    rpID: "cred.byayush.com",
    // rpID: "localhost",
    userVerification: "preferred",
  });

  // store challenge globally (DB used for simplicity)
  await User.updateMany(
    {},
    { $set: { loginPasskeyChallenge: options.challenge } }
  );

  res.json({ options });
};

module.exports.verifyLoginPasskeyResult = async (req, res) => {
  console.log("\n================ PASSKEY LOGIN DEBUG ================");
  console.log("at verifyLoginPasskeyResult");

  try {
    const { cred } = req.body;

    if (!cred || !cred.rawId) {
      console.error("❌ Missing cred or rawId");
      return res.status(400).json({ verified: false, error: "Invalid credential" });
    }

    console.log("▶ rawId (base64url):", cred.rawId);

    // Decode credential ID
    const credentialID = Buffer.from(cred.rawId, "base64url");
    console.log("▶ decoded credentialID (hex):", credentialID.toString("hex"));
    console.log("▶ decoded credentialID length:", credentialID.length);

    // Fetch all users with passkeys (DEBUG ONLY)
    const usersWithPasskeys = await User.find(
      { "passkeys.0": { $exists: true } },
      { username: 1, passkeys: 1, loginPasskeyChallenge: 1 }
    );

    console.log(`▶ users with passkeys found: ${usersWithPasskeys.length}`);

    for (const u of usersWithPasskeys) {
      console.log(`  ── user: ${u.username}`);
      console.log(`     loginPasskeyChallenge: ${u.loginPasskeyChallenge}`);

      u.passkeys.forEach((pk, idx) => {
        console.log(`     passkey[${idx}] credentialID (hex):`, pk.credentialID.toString("hex"));
        console.log(`     passkey[${idx}] credentialID length:`, pk.credentialID.length);
      });
    }

    // Actual lookup
    const user = await User.findOne({
      "passkeys.credentialID": credentialID,
    });

    if (!user) {
      console.error("❌ No user matched credentialID");
      return res.status(400).json({ verified: false, error: "Passkey not found" });
    }

    console.log("✅ Matched user:", user.username);

    const passkey = user.passkeys.find(pk =>
      pk.credentialID.equals(credentialID)
    );

    if (!passkey) {
      console.error("❌ User found but passkey mismatch");
      return res.status(400).json({ verified: false, error: "Passkey mismatch" });
    }

    console.log("✅ Matched passkey for user");

    console.log("▶ Expected challenge:", user.loginPasskeyChallenge);

    const verification = await verifyAuthenticationResponse({
      response: cred,
      expectedChallenge: user.loginPasskeyChallenge,
      expectedOrigin: "http://cred.byayush.com",
      expectedRPID: "cred.byayush.com",
      authenticator: {
        credentialID: passkey.credentialID,
        credentialPublicKey: passkey.credentialPublicKey,
        counter: passkey.counter,
      },
    });

    console.log("▶ verification result:", verification);

    if (!verification.verified) {
      console.error("❌ Cryptographic verification failed");
      return res.status(401).json({ verified: false, error: "Verification failed" });
    }

    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter;
    user.loginPasskeyChallenge = undefined;
    await user.save();

    const token = jwt.sign(
      { username: user.username, name: user.name },
      process.env.JWT_SECRET_KEY
    );

    res.cookie("passkeyToken", token, {
      maxAge: 3 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      path: "/",
    });

    console.log("✅ Passkey login successful");
    console.log("====================================================\n");

    return res.json({ verified: true });

  } catch (err) {
    console.error("🔥 Passkey login exception:", err);
    return res.status(500).json({
      verified: false,
      error: "Internal passkey verification error",
    });
  }
};


