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
      GET_USER_DETAILS: "/get_user_details",
    },
    ADMIN: {
      COUNTRY: {
        ADD_COUNTRY: "/add_country",
        VIEW_COUNTRY: "/view_country",
        EDIT_COUNTRY: "/edit_country",
        DELETE_COUNTRY: "/delete_country",
        ASSIGNED_COUNTRY: "/assigned_country",
        UNASSIGNED_COUNTRY: "/unassigned_country",
        ADD_COUNTRY_FROM_CSV: "/add_country_from_csv",
        SEND_COUNTRY_TO_CSV: "/export_country_to_csv",
      },
      STATE: {
        ADD_STATE: "/add_state",
        VIEW_STATE: "/view_state",
        EDIT_STATE: "/edit_state",
        DELETE_STATE: "/delete_state",
        ASSIGNED_STATE: "/assigned_state",
        UNASSIGNED_STATE: "/unassigned_state",
        ADD_STATE_FROM_CSV: "/add_state_from_csv",
        SEND_STATE_TO_CSV: "/export_state_to_csv",
      },
      CATEGORY: {
        ADD_CATEGORY: "/add_category",
        EDIT_CATEGORY: "/edit_category",
        VIEW_CATEGORY: "/view_category",
        DELETE_CATEGORY: "/delete_category",
        ASSIGNED_CATEGORY: "/assigned_category",
        UNASSIGNED_CATEGORY: "/unassigned_category",
        VIEW_ALL_CATEGORY: "/view_all_category",
        ADD_CATEGORY_FROM_CSV: "/add_category_from_csv",
        SEND_CATEGORY_DATA_TO_CSV: "/export_category_to_csv",
      },
      CATEGORY_META: {
        ADD_CATEGORY_META: "/add_category_meta",
        EDIT_CATEGORY_META: "/edit_category_meta",
        VIEW_CATEGORY_META: "/view_category_meta",
        DELETE_CATEGORY_META: "/delete_category_meta",
        ADD_META_FROM_CSV: "/add_meta_from_csv",
        SEND_META_TO_CSV: "/export_meta_to_csv",
      },
      PRODUCT: {
        ADD_PRODUCT: "/add_product",
        EDIT_PRODUCT: "/edit_product",
        DELETE_PRODUCT: "/delete_product",
        VIEW_PRODUCT: "/view_product",
        ASSIGNED_PRODUCT: "/assigned_product",
        UNASSIGNED_PRODUCT: "/unassigned_product",
        VIEW_ALL_PRODUCT: "/view_all_product",
        ADD_PRODUCT_FROM_CSV: "/add_product_from_csv",
        SEND_PRODUCT_TO_CSV: "/export_product_to_csv",
      },
      PRODUCT_META: {
        ADD_PRODUCT_META: "/add_product_meta",
        EDIT_PRODUCT_META: "/edit_product_meta",
        DELETE_PRODUCT_META: "/delete_product_meta",
        VIEW_PRODUCT_META: "/view_product_meta",
        ADD_PRODUCT_META_FROM_CSV: "/add_product_meta_from_csv",
        SEND_PRODUCT_META_TO_CSV: "/export_product_meta_to_csv",
      },
      ASSIGN_CAT_PRD: {
        ADD_ASSIGN_CAT_PRD: "/add_assign_cat_prd",
        EDIT_ASSIGN_CAT_PRD: "/edit_assign_cat_prd",
        VIEW_ASSIGN_CAT_PRD: "/view_assign_cat_prd",
        DELETE_ASSIGN_CAT_PRD: "/delete_assign_cat_prd",
        ASSIGNED_ASSIGN_CAT_PRD: "/assigned_assign_cat_prd",
        UNASSIGNED_ASSIGN_CAT_PRD: "/unassigned_assign_cat_prd",
        ADD_ASSIGN_CAT_PRD_FROM_CSV: "/add_assign_cat_prd_from_csv",
        SEND_ASSIGN_CAT_PRD_TO_CSV: "/send_assign_cat_prd_from_csv",
      },
      ATTRIBUTES: {
        ADD_ATTRIBUTES: "/add_attributes",
        EDIT_ATTRIBUTES: "/edit_attributes",
        VIEW_ATTRIBUTES: "/view_attributes",
        DELETE_ATTRIBUTES: "/delete_attributes",
        ASSIGNED_ATTRIBUTES: "/assigned_attributes",
        UNASSIGNED_ATTRIBUTES: "/unassigned_attributes",
        VIEW_ALL_ATTRIBUTES: "/view_all_attributes",
        ADD_ATTRIBUTES_FROM_CSV: "/add_attributes_from_csv",
        SEND_ATTRIBUTES_TO_CSV: "/send_attributes_from_csv",
      },
      ATTRIBUTES_OPTION: {
        ADD_ATTRIBUTES_OPTION: "/add_attributes_options",
        EDIT_ATTRIBUTES_OPTION: "/edit_attributes_options",
        VIEW_ATTRIBUTES_OPTION: "/view_attributes_options",
        DELETE_ATTRIBUTES_OPTION: "/delete_attributes_options",
        ADD_ATTRIBUTES_OPTION_FROM_CSV: "/add_attributes_options_from_csv",
        SEND_ATTRIBUTES_OPTION_TO_CSV: "/send_attributes_options_from_csv",
      },
    },
  },
  ROUTER: {
    USER: "/users",
    COUNRTY: "/country",
    STATE: "/state",
    CATEGORY: "/category",
    CATEGORY_META: "/category_meta",
    PRODUCT: "/product",
    PRODUCT_META: "/product_meta",
    ASSIGN_CAT_PRD: "/assign_cat_prd",
    ATTRIBUTES: "/attributes",
    ATTRIBUTES_OPTION: "/attributes_option",
  },
  COLLECTION: {
    USER: "users",
    COUNRTY: "country",
    STATE: "state",
    CATEGORY: "category",
    CATEGORY_META: "category_meta",
    PRODUCT: "product",
    PRODUCT_META: "product_meta",
    ASSIGN_CAT_PRD: "assign_cat_prd",
    ATTRIBUTES: "attributes",
    ATTRIBUTES_OPTION: "attributes_option",
  },
  REGEXP: {
    NAME: /^([\w]{1,})+\s+([\w\s]{1,})+$/i,
    EMAIL:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PASSWORD:
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?#&^_()+-/])([a-zA-Z0-9@$!%*?#&^_()+-/]{8,})$/,
    CONTACT_NO: /^\d{10}$/,
    OBJECT_ID: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
  },
  SCHEMA_MESSAGE: {
    _ID: {
      INVALID: "Invalid _id",
      ID: "_id should not be empty!",
    },
    SEARCH: "search field can not be empty!",
    CSV: {
      CSV_NAME: "csv file should be selected",
      CSV_SIZE: "csv file size is too large",
    },
    PAGINATION: {
      STARTING_AFTER: "starting after parameter is missing",
      LIMIT: "limit parameter is missing",
    },
    META: {
      META_TITLE: "meta title should not be empty!",
      META_KEYWORD: "Meta keyword should not be empty!",
      META_DESC: "Meta description should not be empty!",
      META_ID: "Meta _id should be valid!",
      META_CONTENT: "Meta content should not be empty!",
    },
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
    COUNTRY: {
      COUNTRY_NAME: "country name should not be empty!",
      COUNTRY_CODE: "country code should not be empty!",
      COUNTRY_ID: "country id should not be empty!",
      COUNTRY_ID_INVALID: "country id is invalid!",
    },
    STATE: {
      STATE_NAME: "state name should not be empty!",
      STATE_CODE: "state code should not be empty!",
      STATE_ID: "state id should not be empty!",
      STATE_ID_INVALID: "state id is invalid!",
    },
    CATEGORY: {
      CATEGORY_NAME: "category name should not be empty!",
      CATEGORY_CODE: "category code should not be empty!",
      CATEGORY_PAGE_CONTENT: "category page content should not be empty!",
      CATEGORY_ID: "category_id is not valid!",
    },
    CATEGORY_META: {
      CATEGORY_ID: "At least one category should be selected!",
    },
    PRODUCT: {
      PRODUCT_NAME: "Product name should not be empty!",
      PRODUCT_CODE: "Product code should not be empty!",
      PRODUCT_PRICE: "Product Price should not be empty!",
      PRODUCT_COST: "Product cost should not be empty!",
      PRODUCT_WEIGHT: "Product weight should not be empty!",
      PRODUCT_DESCRIPTION: "Product description should not be empty!",
      PRODUCT_TAXABLE: "Product taxable should not be empty!",
      PRODUCT_CATEGORY_ID: "Product category should not be emopty!",
      INVALID_ID: "Invalid _id",
      PRODUCT_ID: "Product _id should not be empty!",
    },
    PRODUCT_META: {
      PRODUCT_ID: "At least one product should be select for product meta!",
    },
    ASSIGN_CAT_PRD: {
      PRODUCT_ID:
        "At least one product should be select for assign category product!",
      CATEGORY_ID:
        "At least one category should be selected for assign category product!",
    },
    ATTRIBUTES: {
      ATTRIBUTES_PROMPT: "attributes prompt should not be empty!",
      ATTRIBUTES_CODE: "attributes code should not be empty!",
      ATTRIBUTES_TYPE: "attributes type should not be empty!",
      ATTRIBUTES_IMAGE: "attributes image should not be empty!",
      ATTRIBUTES_MESSAGE: "attributes label should not be empty!",
      ATTRIBUTES_LABEL_CODE: "attributes label code should not be empty!",
    },
    ATTRIBUTES_OPTIONS: {
      ATTRIBUTES_OPTIONS_PROMPT:
        "attributes options prompt should not be empty!",
      ATTRIBUTES_OPTIONS_CODE: "attributes options code should not be empty!",
      ATTRIBUTES_OPTIONS_IMAGE: "attributes options image should not be empty!",
      ATTRIBUTES_OPTIONS_PRICE: "attributes options price should not be empty!",
      ATTRIBUTES_OPTIONS_COST: "attributes options cost should not be empty!",
    },
  },
  RESPONSE: {
    DATA: "Data already exsist.",
    FAILED: "Error occurred. Try again.",
    WARNING: "Some warning",
    ADD: "Data added successfully.",
    EDIT: "Data updated successfully.",
    DELETE: "Data deleted successfully.",
    FOUND: "Data(s) found.",
    NOT_FOUND: "No data found.",
    UPLOAD_SUCCESS: "Media uploaded successfully.",
    UPLOAD_ERROR: "Error occour csv file is not in correct format",
    MAIL_SENT: "An email has been sent to your account.",
    INVALID_USER: "invalid user",
    EMAIL_EXISTS: "Email already exists",
    NO_USER_EXISTS: "User was not found. Please sign up.",
    INVALID_CREDENTIALS: "Incorrect username/password",
    LOGIN_SUCCESS: "Login Successful!",
    LOGOUT_SUCCESS: "Logout Successful!",
    PASSWORDS_DONT_MATCH: "Error: Passwords don't match",
    RESET_CODE_EXPIRED: "Error: Reset Password code expired",
    ACCESS_DENIED: "Don't have access!",
    USER_TOKEN_NOT_FOUND: "user token is mandatory!",
    OTP_GENERATION_FAILED: "opt generation failed!",
    EMAIL_VERIFICATION_SUCCESSFUL: "Email successfully verified",
    EMAIL_VERIFICATION_FAILED: "Email verification failed",
  },
};

module.exports = { ...config };
