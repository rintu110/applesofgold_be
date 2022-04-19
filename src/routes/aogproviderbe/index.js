const router = require("../../app");
const country = require("./country");
const state = require("./state");
const category = require("./category");
const category_meta = require("./category_meta");
const product = require("./product");
const product_meta = require("./product_meta");
const assign_cat_prd = require("./assign_cat_prd");
const attribute = require("./attributes");
const config = require("../../config/config");

const { ROUTER } = config;

router.use(ROUTER.COUNRTY, country);
router.use(ROUTER.STATE, state);
router.use(ROUTER.CATEGORY, category);
router.use(ROUTER.CATEGORY_META, category_meta);
router.use(ROUTER.PRODUCT, product);
router.use(ROUTER.PRODUCT_META, product_meta);
router.use(ROUTER.ASSIGN_CAT_PRD, assign_cat_prd);
router.use(ROUTER.ATTRIBUTES, attribute);

module.exports = router;
