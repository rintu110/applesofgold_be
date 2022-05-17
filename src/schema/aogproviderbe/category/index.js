const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addCategorySchema: yup.object({
    category_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_CODE),
  }),

  editCategorySchema: yup.object({
    category_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_CODE),
    category_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID)
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID),
  }),

  deleteCategorySchema: yup.object({
    category_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID)
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID),
  }),
};
