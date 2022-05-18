const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

const { PRODUCT, _ID, ATTRIBUTES } = SCHEMA_MESSAGE;

module.exports = {
  addProductSchema: yup.object({
    product_name: yup.string().trim().required(PRODUCT.NAME),
    sku: yup.string().trim().required(PRODUCT.SKU),
    msrp: yup.string().trim().required(PRODUCT.MSRP),
    price: yup.string().trim().required(PRODUCT.PRICE),
    description: yup.string().trim(),
    thumbnail_image: yup.string().trim().url(),
    closeup_image: yup.string().trim().url(),
    gender: yup.string().trim().oneOf(["male", "female", "other"]),
    metaltype: yup.string().trim(),
    weight: yup.string().trim(),
    quantity: yup.string().trim(),
    alternative_images: yup
      .array()
      .of(yup.string().trim().url(PRODUCT.ALTERNATIVE_IMAGE)),
    related_product_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
    category_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
    local_attribute: yup.array().of(
      yup.object({
        prompt: yup.string().trim(),
        code: yup.string().trim(),
        image: yup.string().trim().url(),
        attr_type: yup
          .string()
          .trim()
          .oneOf(
            ["checkBox", "radioButton", "dropdownList", "textBox", "textArea"],
            ATTRIBUTES.ATTRIBUTES_TYPE
          ),
        attr_options: yup.array().of(
          yup.object({
            prompt: yup.string().trim(),
            code: yup.string().trim(),
            price: yup.string().trim(),
            defaults: yup
              .boolean()
              .oneOf([true, false])
              .required(ATTRIBUTES.ATTRIBUTES_OPTION_DEFAULT),
          })
        ),
        required: yup.boolean().oneOf([true, false]),
      })
    ),
    global_attribute_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
  }),

  editProductSchema: yup.object({
    product_name: yup.string().trim().required(PRODUCT.NAME),
    sku: yup.string().trim().required(PRODUCT.SKU),
    msrp: yup.string().trim().required(PRODUCT.MSRP),
    price: yup.string().trim().required(PRODUCT.PRICE),
    description: yup.string().trim(),
    thumbnail_image: yup.string().trim().url(),
    closeup_image: yup.string().trim().url(),
    gender: yup.string().trim().oneOf(["male", "female", "other"]),
    metaltype: yup.string().trim(),
    weight: yup.string().trim(),
    quantity: yup.string().trim(),
    alternative_images: yup
      .array()
      .of(yup.string().trim().url(PRODUCT.ALTERNATIVE_IMAGE)),
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
    related_product_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
    category_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
  }),

  deleteProductSchema: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
    local_attribute: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID)),
  }),

  viewProductAttribute: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
  }),

  updateProductAttribute: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
    local_attribute: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID))
      .required(PRODUCT.LOCAL_ATTRIBUTE),
  }),

  updateProductGlobalAttribute: yup.object({
    product_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, _ID.INVALID)
      .required(_ID.ID),
    global_attribute_ids: yup
      .array()
      .of(yup.string().trim().matches(REGEXP.OBJECT_ID, _ID.INVALID))
      .required(PRODUCT.LOCAL_ATTRIBUTE),
  }),
};
