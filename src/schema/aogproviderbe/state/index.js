const yup = require("yup");
const config = require("../../../config/config");

const { SCHEMA_MESSAGE, REGEXP } = config;

module.exports = {
  addStateSchema: yup.object({
    state_nm: yup.string().trim().required(SCHEMA_MESSAGE.STATE.STATE_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.STATE.STATE_CODE),
  }),

  viewStateSchema: yup.object({
    startingAfter: yup
      .number()
      .nullable()
      .required(SCHEMA_MESSAGE.PAGINATION.STARTING_AFTER),
    limit: yup.number().nullable().required(SCHEMA_MESSAGE.PAGINATION.LIMIT),
  }),

  editStateSchema: yup.object({
    state_nm: yup.string().trim().required(SCHEMA_MESSAGE.STATE.STATE_NAME),
    code: yup.string().trim().required(SCHEMA_MESSAGE.STATE.STATE_CODE),
    state_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.STATE.STATE_ID_INVALID)
      .required(SCHEMA_MESSAGE.STATE.STATE_ID),
  }),

  deleteStateSchema: yup.object({
    state_id: yup
      .string()
      .trim()
      .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.STATE.STATE_ID_INVALID)
      .required(SCHEMA_MESSAGE.STATE.STATE_ID),
  }),

  assigneUnassignedSchema: yup.object({
    state_id: yup
      .array()
      .min(1)
      .of(
        yup
          .string()
          .trim()
          .matches(REGEXP.OBJECT_ID, SCHEMA_MESSAGE.STATE.STATE_ID_INVALID)
      )
      .required(SCHEMA_MESSAGE.STATE.STATE_ID),
  }),
};
