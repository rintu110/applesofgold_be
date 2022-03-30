const config = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  USER_TYPE: {
    SA: "SA", //This is super admin
    U: "U", //This is user
    A: "A", //This is admin.
  },
  API: {
    USER: {
      REGISTER_USER: "/register_users",
      LOGIN_USER: "/login_users",
    },
  },
  ROUTER: {
    USER: "/users",
  },
  COLLECTION: {
    USER: "users",
  },
  REGEXP: {
    NAME: /^([\w]{1,})+\s+([\w\s]{1,})+$/i,
    EMAIL:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PASSWORD:
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?#&^_()+-/])([a-zA-Z0-9@$!%*?#&^_()+-/]{8,})$/,
    CONTACT_NO: /^\d{10}$/,
  },
  SCHEMA_MESSAGE: {
    USER: {
      NAME: "name field can not be empty! ",
      VALID_NAME: "name should have first and last name",
      EMAIL: "email field can not be empty! ",
      VALID_EMAIL: "email should be valid like person@gmail.com",
      PASSWORD: "password field can not be empty! ",
      VALID_PASSWORD: "password should be a valid password",
      CONTACT_NO: "contact no. should be 10 digit",
      USER_TYPE: "user_type field can not be empty!",
    },
  },
  RESPONSE: {
    FAILED: "Error occurred. Try again.",
    WARNING: "Some warning",
    ADD: "Data added successfully.",
    EDIT: "Data updated successfully.",
    DELETE: "Data deleted successfully.",
    FOUND: "Data(s) found.",
    NOT_FOUND: "No data found.",
    UPLOAD_SUCCESS: "Media uploaded successfully.",
    UPLOAD_ERROR: "Error occurred while uploading the media.",
    MAIL_SENT: "An email has been sent to your account.",
    INVALID_USER: "invalid user",
    ERROR_VALIDATING_USER: "error validating user",
    ERROR_DECRYPTING: "error decrypting data",
    EMAIL_EXISTS: "Email already exists",
    NO_USER_EXISTS: "User was not found. Please sign up.",
    INVALID_CREDENTIALS: "Incorrect username/password",
    LOGIN_SUCCESS: "Login Successful!",
    LOGOUT_SUCCESS: "Logout Successful!",
    PASSWORDS_DONT_MATCH: "Error: Passwords don't match",
    RESET_CODE_EXPIRED: "Error: Reset Password code expired",
    ORDER_EXISTS: "order already exists",
    NO_COURSE_EXISTS: "No such course exists",
    NO_EVENT_EXISTS: "No such event exists",
    ACCESS_DENIED: "Don't have access!",
    USER_TOKEN_NOT_FOUND: "user token is mandatory!",
    OTP_GENERATION_FAILED: "opt generation failed!",
    EMAIL_VERIFICATION_SUCCESSFUL: "Email successfully verified",
    EMAIL_VERIFICATION_FAILED: "Email verification failed",
  },
};

module.exports = { ...config };
