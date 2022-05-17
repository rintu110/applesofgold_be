const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

const { _ID } = SCHEMA_MESSAGE;

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
    image: yup.string().trim().url(),
    attr_type: yup
      .string()
      .trim()
      .oneOf(["checkBox", "radioButton", "dropdownList", "textBox", "textArea"])
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_TYPE),
    required: yup
      .boolean()
      .oneOf([true, false])
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_OPTION_DEFAULT),
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
    image: yup.string().trim().url(),
    attr_type: yup
      .string()
      .trim()
      .oneOf(["checkBox", "radioButton", "dropdownList", "textBox", "textArea"])
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_TYPE),
    required: yup
      .boolean()
      .oneOf([true, false])
      .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_OPTION_DEFAULT),
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

  addAttributeOptionSchema: yup.object({
    attr_options: yup.array().of(
      yup.object({
        prompt: yup
          .string()
          .trim()
          .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_PROMPT),
        code: yup
          .string()
          .trim()
          .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_CODE),
        price: yup
          .string()
          .trim()
          .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_OPTION_PRICE),
        defaults: yup
          .boolean()
          .oneOf([true, false])
          .required(SCHEMA_MESSAGE.ATTRIBUTES.ATTRIBUTES_OPTION_DEFAULT),
      })
    ),
    attr_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE._ID.ID),
  }),

  viewProductGlobalAttribute: yup.object({
    attribute_ids: yup
      .array()
      .of(
        yup
          .string()
          .trim()
          .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      ),
  }),

  addProductGlobalAttribute: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
    global_attribute_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
  }),
};
