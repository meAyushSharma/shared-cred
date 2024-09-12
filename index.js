require("dotenv").config();
const express = require("express");
const session = require('express-session');
// const MongoStore = require('connect-mongo');
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { router } = require("./routes/routes");

const cors = require('cors');
app.use(cors({
  origin: 'https://credential-manager-cdl1.onrender.com',
  credentials: true
}));

const app = express();
// to read body inputs and parse cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


// set the session
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized:true,
}));



app.use("/credential-manager", router);

// middleware to catch errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(process.env.PORT || 3005, '0.0.0.0',  () => {
  console.log(`server running on: http://localhost:${process.env.PORT}/credential-manager/`);
});
