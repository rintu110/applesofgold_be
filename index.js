const express = require("express");
const cors = require("cors");
require("dotenv").config();
var express_fileUpload = require("express-fileupload");
const Database = require("./src/database/connect");
const Index = require("./src/routes/welcome");
const Router = require("./src/routes");
const AdminRouter = require("./src/routes/aogproviderbe");
const { PORT } = require("./src/config/config");

const App = express();

App.set("port", PORT);

App.use(cors());

Database.connect(() => {
  App.listen(App.get("port"), function () {
    console.log("app is running on port " + App.get("port"));
  });
});

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(express.raw());
App.use(express_fileUpload());

App.use("/", Index);
App.use("/applesofgold/api", Router);
App.use("/applesofgold/admin/api", AdminRouter);
