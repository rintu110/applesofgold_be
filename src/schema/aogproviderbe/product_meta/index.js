const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addProductMetaSchema: yup.object({
    prd_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE.PRODUCT_META.PRODUCT_ID),
    meta_keyword: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.META.META_KEYWORD),
    meta_desc: yup.string().trim().required(SCHEMA_MESSAGE.META.META_DESC),
    meta_title: yup.string().trim().required(SCHEMA_MESSAGE.META.META_TITLE),
  }),

  editProductMetaSchema: yup.object({
    prd_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE.PRODUCT_META.PRODUCT_ID),
    meta_keyword: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.META.META_KEYWORD),
    meta_desc: yup.string().trim().required(SCHEMA_MESSAGE.META.META_DESC),
    meta_title: yup.string().trim().required(SCHEMA_MESSAGE.META.META_TITLE),
    meta_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE.META.META_ID),
  }),

  deleteProductMetaSchema: yup.object({
    meta_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE._ID.INVALID)
      .required(SCHEMA_MESSAGE.META.META_ID),
  }),
};
