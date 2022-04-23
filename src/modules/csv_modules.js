const { viewAll } = require("../mongo-qury/findAll");

module.exports = {
  findCategory: (collection, filter, csvrow, callBack) => {
    let row = [];

    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length
      ) {
        row = await csvrow.map((item) =>
          result.find((item2) => item.category_nm === item2.category_nm) !==
          undefined
            ? {
                ...item,
                cat_id: result.find(
                  (item2) => item.category_nm === item2.category_nm
                )._id,
              }
            : { ...item, cat_id: 0 }
        );
        callBack(row);
      } else {
        row = await csvrow.map((item) => ({
          ...item,
          cat_id: 0,
        }));
        callBack(row);
      }
    });
  },

  findProduct: (collection, filter, csvrow, callBack) => {
    let row = [];

    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length
      ) {
        row = await csvrow.map((item) =>
          result.find((item2) => item.product_nm === item2.product_nm) !==
          undefined
            ? {
                ...item,
                prd_id: result.find(
                  (item2) => item.product_nm === item2.product_nm
                )._id,
              }
            : { ...item, prd_id: 0 }
        );
        callBack(row);
      } else {
        row = await csvrow.map((item) => ({
          ...item,
          prd_id: 0,
        }));
        callBack(row);
      }
    });
  },

  findAttribute: (collection, filter, csvrow, callBack) => {
    let row = [];

    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length
      ) {
        row = await csvrow.map((item) =>
          result.find((item2) => item.attribute_prompt === item2.prompt) !==
          undefined
            ? {
                ...item,
                attr_id: result.find(
                  (item2) => item.attribute_prompt === item2.prompt
                )._id,
              }
            : { ...item, attr_id: 0 }
        );
        callBack(row);
      } else {
        row = await csvrow.map((item) => ({
          ...item,
          attr_id: 0,
        }));
        callBack(row);
      }
    });
  },

  findAllAttribute: (collection, filter, rows, callBack) => {
    let row = [];
    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length
      ) {
        row = rows.map((item) =>
          result.find(
            (item2) => item.attr_id.toString() == item2._id.toString()
          ) !== undefined
            ? {
                ...item,
                attribute_prompt: result.find(
                  (item2) => item.attr_id.toString() === item2._id.toString()
                ).prompt,
              }
            : {
                ...item,
                attribute_prompt: "",
              }
        );

        callBack(row);
      } else {
        row = rows.map((item) => ({
          ...item,
          attribute_prompt: "",
        }));

        callBack(row);
      }
    });
  },

  findAllCategory: (collection, filter, rows, callBack) => {
    let row = [];
    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length
      ) {
        row = rows.map((item) =>
          result.find(
            (item2) => item.cat_id.toString() == item2._id.toString()
          ) !== undefined
            ? {
                ...item,
                category_nm: result.find(
                  (item2) => item.cat_id.toString() === item2._id.toString()
                ).category_nm,
              }
            : {
                ...item,
                category_nm: "",
              }
        );

        callBack(row);
      } else {
        row = rows.map((item) => ({
          ...item,
          category_nm: "",
        }));

        callBack(row);
      }
    });
  },

  findAllProduct: (collection, filter, rows, callBack) => {
    let row = [];
    viewAll(filter, collection, async (status, message, result) => {
      if (
        result !== null &&
        result !== undefined &&
        result !== "" &&
        result.length > 0
      ) {
        row = rows.map((item) =>
          result.find(
            (item2) => item.prd_id.toString() == item2._id.toString()
          ) !== undefined
            ? {
                ...item,
                product_nm: result.find(
                  (item2) => item.prd_id.toString() === item2._id.toString()
                ).product_nm,
              }
            : {
                product_nm: "",
                ...item,
              }
        );
        callBack(row);
      } else {
        row = rows.map((item) => ({
          ...item,
          product_nm: "",
        }));
        callBack(row);
      }
    });
  },
};
