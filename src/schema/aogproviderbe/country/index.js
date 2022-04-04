const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addCountrySchema: yup.object({
    country_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_CODE),
  }),

  viewCountrySchema: yup.object({
    startingAfter: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PAGINATION.STARTING_AFTER),
    limit: yup.number().nullable().required(SCHEMA_MESSAGE.PAGINATION.LIMIT),
  }),

  editCountrySchema: yup.object({
    country_nm: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_CODE),
    country_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID_INVALID)
      .required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID),
  }),

  deleteCountrySchema: yup.object({
    country_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID_INVALID)
      .required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID),
  }),

  assigneUnassignedSchema: yup.object({
    country_id: yup
      .array()
      .min(1)
      .of(
        yup
          .string()
          .trim()
          .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID_INVALID)
      )
      .required(SCHEMA_MESSAGE.COUNTRY.COUNTRY_ID),
  }),
};
