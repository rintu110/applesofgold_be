const yup = require("yup");
const config = require("../../config/config");

const { SCHEMA_MESSAGE, REGEXP, USER_TYPE } = config;

module.exports = {
  user_register_schema: yup.object({
    username: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.USER.NAME)
      .matches(REGEXP.NAME, SCHEMA_MESSAGE.USER.VALID_NAME),
    mobile: yup
      .string()
      .trim()
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, SCHEMA_MESSAGE.USER.CONTACT_NO)
      .max(10, SCHEMA_MESSAGE.USER.CONTACT_NO)
      .nullable()
      .required(SCHEMA_MESSAGE.USER.CONTACT_NO),
    user_type: yup
      .string()
      .trim()
      .oneOf([USER_TYPE.SA, USER_TYPE.A, USER_TYPE.U], "Invalid user type")
      .required(SCHEMA_MESSAGE.USER.USER_TYPE),
    email: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.USER.EMAIL)
      .matches(REGEXP.EMAIL, SCHEMA_MESSAGE.USER.VALID_EMAIL),
    password: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.USER.PASSWORD)
      .matches(REGEXP.PASSWORD, SCHEMA_MESSAGE.USER.VALID_PASSWORD),
  }),

  user_login_schema: yup.object({
    email: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.USER.EMAIL)
      .matches(REGEXP.EMAIL, SCHEMA_MESSAGE.USER.VALID_EMAIL),
    password: yup
      .string()
      .trim()
      .required(SCHEMA_MESSAGE.USER.PASSWORD)
      .matches(REGEXP.PASSWORD, SCHEMA_MESSAGE.USER.VALID_PASSWORD),
  }),
};
