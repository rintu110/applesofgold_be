const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addAttributeOptionSchema: yup.object({
    prompt: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_PROMPT),
    code: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_CODE),
    image: yup
      .string()
      .trim()
      .url()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_IMAGE),
    price: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_PRICE),
    cost: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_COST),
    attr_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),

  editAttributeOptionSchema: yup.object({
    prompt: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_PROMPT),
    code: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_CODE),
    image: yup
      .string()
      .trim()
      .url()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_IMAGE),
    price: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_PRICE),
    cost: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES_OPTIONS.ATTRIBUTES_OPTIONS_COST),
    attr_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
    option_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),

  deleteAttributeOptionSchema: yup.object({
    option_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),
};
