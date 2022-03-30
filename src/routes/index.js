const router = require("../app");
const user = require("./user");
const config = require("../config/config");
const { ROUTER } = config;

router.use(ROUTER.USER, user);

module.exports = router;
