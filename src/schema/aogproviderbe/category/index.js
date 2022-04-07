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
    page_content: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_PAGE_CONTENT),
  }),

  viewCategorySchema: yup.object({
    startingAfter: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PAGINATION.STARTING_AFTER),
    limit: yup.number().nullable().required(SCHEMA_MESSAGE.PAGINATION.LIMIT),
  }),

  editCategorySchema: yup.object({
    category_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_CODE),
    page_content: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_PAGE_CONTENT),
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

  assigneUnassignedSchema: yup.object({
    category_id: yup
      .array()
      .min(1)
      .of(
        yup
          .string()
          .trim()
          .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID)
      )
      .required(SCHEMA_MESSAGE.CATEGORY.CATEGORY_ID),
  }),
};
