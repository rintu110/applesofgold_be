const router = require("../../app");
const country = require("./country");
const state = require("./state");
const config = require("../../config/config");

const { ROUTER } = config;

router.use(ROUTER.COUNRTY, country);
router.use(ROUTER.STATE, state);

module.exports = router;
