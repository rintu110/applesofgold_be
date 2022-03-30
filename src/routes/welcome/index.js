const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Welcome to ApplesOfGold Server"));

module.exports = router;
