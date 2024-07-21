require("dotenv").config();
const express = require("express");
const session = require('express-session');
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { router } = require("./routes/routes");
const app = express();


// to read body inputs and parse cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// set the session
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized:true
}));



app.use("/credential-manager", router);

// middleware to catch errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(process.env.PORT, () => {
  console.log(`server running on: http://localhost:${process.env.PORT}/credential-manager/`);
});
