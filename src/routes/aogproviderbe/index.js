const router = require("../../app");
const country = require("./country");
const state = require("./state");
const category = require("./category");
const category_meta = require("./category_meta");
const config = require("../../config/config");

const { ROUTER } = config;

router.use(ROUTER.COUNRTY, country);
router.use(ROUTER.STATE, state);
router.use(ROUTER.CATEGORY, category);
router.use(ROUTER.CATEGORY_META, category_meta);

module.exports = router;
