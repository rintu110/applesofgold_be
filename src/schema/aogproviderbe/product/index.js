const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addProductSchema: yup.object({
    cat_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.PRODUCT.INVALID_ID)
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_CATEGORY_ID),
    product_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_CODE),
    price: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_PRICE),
    cost: yup.number().nullable().required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_COST),
    weight: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_WEIGHT),
    prd_desc: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_DESCRIPTION),
    taxable: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_TAXABLE),
  }),

  editProductSchema: yup.object({
    cat_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.PRODUCT.INVALID_ID)
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_CATEGORY_ID),
    product_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_CODE),
    price: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_PRICE),
    cost: yup.number().nullable().required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_COST),
    weight: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_WEIGHT),
    prd_desc: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_DESCRIPTION),
    taxable: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_TAXABLE),
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.PRODUCT.INVALID_ID)
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_ID),
  }),

  deleteProductSchema: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.PRODUCT.INVALID_ID)
      .required(SCHEMA_MESSAGE.PRODUCT.PRODUCT_ID),
  }),
};
