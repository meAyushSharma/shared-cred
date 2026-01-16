const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL).then(() => { console.log("successfully connected to database...") })
  .catch((err) => {
    console.log(`there was some error while creating the database::: ${err}`);
  });

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,

  /* =========================
   * PASSKEY REGISTRATION
   * ========================= */
  passkeyChallenge: {
    type: String,
    default: "",
  },

  passkeys: [
    {
      credentialID: {
        type: Buffer,
        required: true,
      },
      credentialPublicKey: {
        type: Buffer,
        required: true,
      },
      counter: {
        type: Number,
        default: 0,
      },
      credentialType: {
        type: String,
      },
      userVerified: {
        type: Boolean,
      },
      rpID: {
        type: String,
      },
    },
  ],

  /* =========================
   * PASSKEY LOGIN
   * ========================= */
  loginPasskeyChallenge: {
    type: String,
    default: "",
  },

  /* =========================
   * EXISTING FIELDS (UNCHANGED)
   * ========================= */
  credImageURLs: [
    {
      url: { type: String },
      name: { type: String },
      publicId: { type: String },
    },
  ],

  encryptedSymmetricKeys: [
    {
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
      encryptedSymmetricKey: { type: String },
    },
  ],

  publicKey: {
    type: String,
    default: "",
  },

  code: {
    forgotCode: String,
    timeCreatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  hasExportedKeys: {
    type: Boolean,
    default: false
  }
});


const ResourceSchema = new mongoose.Schema({
  resourceName: String,
  resourceValue: String,
  resourceSharedWith: {
    type: Boolean,
    default: false,
  },
  resourceOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  editors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  authors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  symmetricKey: String
});

const User = mongoose.model("User", UserSchema);
const Resource = mongoose.model("Resource", ResourceSchema);

module.exports = {
  User,
  Resource,
};
