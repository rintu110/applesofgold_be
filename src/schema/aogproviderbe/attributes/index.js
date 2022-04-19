const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addAttributeSchema: yup.object({
    prompt: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_PROMPT),
    code: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_CODE),
  }),

  editAttributeSchema: yup.object({
    prompt: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_PROMPT),
    code: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_CODE),
    attribute_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),

  deleteAttributeSchema: yup.object({
    attribute_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),
};
