require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const { router } = require("./routes/routes");
const app = express();
app.use(bodyParser.json());

app.use("/credential-manager", router);


app.listen(process.env.PORT, () => {
  console.log(`server running on: http://localhost:${process.env.PORT}/credential-manager/`);
});
