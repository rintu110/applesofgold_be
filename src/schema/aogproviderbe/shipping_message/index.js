const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

const { SHIPPING_MESSAGE } = SCHEMA_MESSAGE;

module.exports = {
  addShippingMessageSchema: yup.object({
    code: yup.string().trim().required(SHIPPING_MESSAGE.CODE),
    shipping_message: yup.string().trim().required(SHIPPING_MESSAGE.MESSAGE),
    shipping_free: yup.string().trim().required(SHIPPING_MESSAGE.FREE),
    shipping_days: yup.number().required(SHIPPING_MESSAGE.DAYS),
    shipping_order: yup.string().trim().required(SHIPPING_MESSAGE.ORDER),
    country_message: yup.string().trim(),
    country_flag: yup.string().trim().url(),
  }),

  editShippingMessageSchema: yup.object({
    code: yup.string().trim().required(SHIPPING_MESSAGE.CODE),
    shipping_message: yup.string().trim().required(SHIPPING_MESSAGE.MESSAGE),
    shipping_days: yup.number().required(SHIPPING_MESSAGE.DAYS),
    shipping_free: yup.string().trim().required(SHIPPING_MESSAGE.FREE),
    shipping_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
    shipping_order: yup.string().trim().required(SHIPPING_MESSAGE.ORDER),
    country_message: yup.string().trim(),
    country_flag: yup.string().trim().url(),
  }),

  deleteShippingMessageSchema: yup.object({
    shipping_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),
};
