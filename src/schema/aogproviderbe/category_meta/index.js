const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addCategoryMetaSchema: yup.object({
    cat_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY_META.CATEGORY_ID)
      .required(SCHEMA_MESSAGE.CATEGORY_META.CATEGORY_ID),
    meta_keyword: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_KEYWORD),
    meta_desc: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_DESC),
    meta_title: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_TITLE),
  }),

  viewCategoryMetaSchema: yup.object({
    startingAfter: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PAGINATION.STARTING_AFTER),
    limit: yup.number().nullable().required(SCHEMA_MESSAGE.PAGINATION.LIMIT),
  }),

  editCategoryMetaSchema: yup.object({
    cat_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY_META.CATEGORY_ID)
      .required(SCHEMA_MESSAGE.CATEGORY_META.CATEGORY_ID),
    meta_keyword: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_KEYWORD),
    meta_desc: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_DESC),
    meta_title: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_TITLE),
    meta_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY_META.META_ID)
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_ID),
  }),

  deleteCategoryMetaSchema: yup.object({
    meta_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY_META.META_ID)
      .required(SCHEMA_MESSAGE.CATEGORY_META.META_ID),
  }),
};
