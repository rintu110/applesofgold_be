const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const filesvalidate = require("../../../validation/fileValidation");
const {
  addProductSchema,
  editProductSchema,
  deleteProductSchema,
} = require("../../../schema/aogproviderbe/product");
const universal = require("../../../schema/universal");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { updateMany } = require("../../../mongo-qury/updateMany");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");
const { ObjectId } = require("mongodb");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.PRODUCT.ADD_PRODUCT,
  validate(addProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      cat_id,
      product_nm,
      price,
      weight,
      prd_desc,
      code,
      cost,
      taxable,
      user_id,
    } = req.body;

    const body = {
      cat_id: new ObjectId(cat_id),
      product_nm: product_nm,
      price: price,
      code: code,
      cost: cost,
      weight: weight,
      prd_desc: prd_desc,
      taxable: taxable,
      created_by: user_id,
      status: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    view(
      { product_nm: product_nm },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: "Product already exists." });
        } else {
          insert(body, COLLECTION.PRODUCT, (status1, message1, result1) => {
            res.json({
              status: status1,
              message: message1,
              result: result1,
            });
          });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.VIEW_PRODUCT,
  validate(universal.viewAdminSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { limit, startingAfter, searchKeyWord } = req.body;
    if (
      searchKeyWord === undefined ||
      searchKeyWord === null ||
      searchKeyWord === ""
    ) {
      viewInPaginationLookUp(
        {},
        {
          from: COLLECTION.CATEGORY,
          localField: "cat_id",
          foreignField: "_id",
          as: "category",
        },
        startingAfter,
        limit,
        COLLECTION.PRODUCT,
        (status, message, result) => {
          if (result[0].result.length > 0) {
            res.json({
              status: status,
              message: message,
              result: result[0].result,
              total: result[0].total[0].total,
            });
          } else {
            res.json({
              status: status,
              message: message,
              result: [],
              total: 0,
            });
          }
        }
      );
    } else {
      viewInPaginationLookUp(
        {
          $or: [
            {
              product_nm: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              price: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              weight: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              prd_desc: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              code: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              cost: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
          ],
        },
        {
          from: COLLECTION.CATEGORY,
          localField: "cat_id",
          foreignField: "_id",
          as: "category",
        },
        startingAfter,
        limit,
        COLLECTION.PRODUCT,
        (status, message, result) => {
          if (result[0].result.length > 0) {
            res.json({
              status: status,
              message: message,
              result: result[0].result,
              total: result[0].total[0].total,
            });
          } else {
            res.json({
              status: status,
              message: message,
              result: [],
              total: 0,
            });
          }
        }
      );
    }
  }
);

router.post(
  API.ADMIN.PRODUCT.EDIT_PRODUCT,
  validate(editProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      cat_id,
      product_nm,
      price,
      weight,
      prd_desc,
      code,
      cost,
      taxable,
      product_id,
    } = req.body;

    const body = {
      $set: {
        cat_id: new ObjectId(cat_id),
        product_nm: product_nm,
        price: price,
        code: code,
        cost: cost,
        weight: weight,
        prd_desc: prd_desc,
        taxable: taxable,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(product_id) },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(product_id) },
            body,
            COLLECTION.PRODUCT,
            (status1, message1, result1) => {
              res.json({ status: status1, message: message1, result: result1 });
            }
          );
        } else {
          res.json({ status: status, message: message, result: result });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.DELETE_PRODUCT,
  validate(deleteProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { product_id } = req.body;

    view(
      { _id: new ObjectId(product_id) },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(product_id) },
            COLLECTION.PRODUCT,
            (status1, message1, result1) => {
              res.json({ status: status1, message: message1, result: result1 });
            }
          );
        } else {
          res.json({ status: status, message: message, result: result });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.ASSIGNED_PRODUCT,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const product_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: product_id } };

    let body = {
      $set: { status: 1 },
    };

    updateMany(filter, body, COLLECTION.PRODUCT, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.PRODUCT.UNASSIGNED_PRODUCT,
  validate(universal.assigneUnassignedSchema),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { _id } = req.body;

    const product_id = await _id.map((item) => new ObjectId(item));

    let filter = { _id: { $in: product_id } };

    let body = {
      $set: { status: 0 },
    };

    updateMany(filter, body, COLLECTION.PRODUCT, (status, message, result) => {
      res.json({ status: status, message: message, result: result });
    });
  }
);

router.post(
  API.ADMIN.PRODUCT.VIEW_ALL_PRODUCT,
  ensureAuthorisedAdmin,
  (req, res) => {
    viewAll({}, COLLECTION.PRODUCT, (status, message, result) => {
      res.json({
        status: status,
        message: message,
        result: result,
      });
    });
  }
);

router.post(
  API.ADMIN.PRODUCT.ADD_PRODUCT_FROM_CSV,
  filesvalidate(universal.importAndExportCsv),
  ensureAuthorisedAdmin,
  async (req, res) => {
    const { user_id } = req.body;
    const { csv } = req.files;

    await csvtojson()
      .fromString(csv.data.toString("utf8"))
      .then((csvrow) => {
        if (csvrow.length > 0) {
          if (
            csvrow[0].hasOwnProperty("category_nm") &&
            csvrow[0].hasOwnProperty("product_nm") &&
            csvrow[0].hasOwnProperty("price") &&
            csvrow[0].hasOwnProperty("weight") &&
            csvrow[0].hasOwnProperty("prd_desc") &&
            csvrow[0].hasOwnProperty("code") &&
            csvrow[0].hasOwnProperty("cost") &&
            csvrow[0].hasOwnProperty("taxable")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.product_nm === "" ||
                item.price === "" ||
                item.weight === "" ||
                item.prd_desc === "" ||
                item.code === "" ||
                item.cost === "" ||
                item.taxable === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.product_nm === "" ||
                  item.price === "" ||
                  item.weight === "" ||
                  item.prd_desc === "" ||
                  item.code === "" ||
                  item.cost === "" ||
                  item.taxable === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.product_nm === "" ||
                valid.price === "" ||
                valid.weight === "" ||
                valid.prd_desc === "" ||
                valid.code === "" ||
                valid.cost === "" ||
                valid.taxable === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                product_nm: {
                  $not: {
                    $in: csvrow.map((item) => ({
                      product_nm: item.product_nm,
                    })),
                  },
                },
              };

              viewAll(
                filter,
                COLLECTION.PRODUCT,
                async (status, message, result) => {
                  if (status && result.length > 0) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find(
                          (item2) => item.product_nm === item2.product_nm
                        )
                    );

                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length > 0
                    ) {
                      let filter = {
                        category_nm: {
                          $not: {
                            $in: row.map((item) => ({
                              category_nm: item.category_nm,
                            })),
                          },
                        },
                      };

                      viewAll(
                        filter,
                        COLLECTION.CATEGORY,
                        async (status, message, result) => {
                          if (
                            result !== null &&
                            result !== undefined &&
                            result !== "" &&
                            result.length > 0
                          ) {
                            row = row.map((item) => {
                              if (
                                result.find(
                                  (item2) =>
                                    item.category_nm === item2.category_nm
                                ) !== undefined
                              ) {
                                return {
                                  product_nm: item.product_nm,
                                  price: item.price,
                                  code: item.code,
                                  cost: item.cost,
                                  weight: item.weight,
                                  prd_desc: item.prd_desc,
                                  taxable: item.taxable,
                                  cat_id: result.find(
                                    (item2) =>
                                      item.category_nm === item2.category_nm
                                  )._id,
                                  created_by: user_id,
                                  status: 0,
                                  created_at: new Date(),
                                  updated_at: new Date(),
                                };
                              } else {
                                return {
                                  product_nm: item.product_nm,
                                  price: item.price,
                                  code: item.code,
                                  cost: item.cost,
                                  weight: item.weight,
                                  prd_desc: item.prd_desc,
                                  taxable: item.taxable,
                                  cat_id: 0,
                                  created_by: user_id,
                                  status: 0,
                                  created_at: new Date(),
                                  updated_at: new Date(),
                                };
                              }
                            });

                            await insertManyBulk(
                              COLLECTION.PRODUCT,
                              row,
                              (status, message, result) => {
                                res.json({
                                  status: status,
                                  message: message,
                                  result: result,
                                });
                              }
                            );
                          } else {
                            let body = row.map((item) => ({
                              product_nm: item.product_nm,
                              price: item.price,
                              code: item.code,
                              cost: item.cost,
                              weight: item.weight,
                              prd_desc: item.prd_desc,
                              taxable: item.taxable,
                              cat_id: 0,
                              created_by: user_id,
                              status: 0,
                              created_at: new Date(),
                              updated_at: new Date(),
                            }));

                            await insertManyBulk(
                              COLLECTION.PRODUCT,
                              body,
                              (status, message, result) => {
                                res.json({
                                  status: status,
                                  message: message,
                                  result: result,
                                });
                              }
                            );
                          }
                        }
                      );
                    } else {
                      res.json({
                        status: false,
                        message: RESPONSE.DATA,
                        result: [],
                      });
                    }
                  } else {
                    let filter = {
                      category_nm: {
                        $not: {
                          $in: csvrow.map((item) => ({
                            category_nm: item.category_nm,
                          })),
                        },
                      },
                    };

                    viewAll(
                      filter,
                      COLLECTION.CATEGORY,
                      async (status, message, result) => {
                        if (
                          result !== null &&
                          result !== undefined &&
                          result !== "" &&
                          result.length > 0
                        ) {
                          row = csvrow.map((item) => {
                            if (
                              result.find(
                                (item2) =>
                                  item.category_nm === item2.category_nm
                              ) !== undefined
                            ) {
                              return {
                                product_nm: item.product_nm,
                                price: item.price,
                                code: item.code,
                                cost: item.cost,
                                weight: item.weight,
                                prd_desc: item.prd_desc,
                                taxable: item.taxable,
                                cat_id: result.find(
                                  (item2) =>
                                    item.category_nm === item2.category_nm
                                )._id,
                                created_by: user_id,
                                status: 0,
                                created_at: new Date(),
                                updated_at: new Date(),
                              };
                            } else {
                              return {
                                product_nm: item.product_nm,
                                price: item.price,
                                code: item.code,
                                cost: item.cost,
                                weight: item.weight,
                                prd_desc: item.prd_desc,
                                taxable: item.taxable,
                                cat_id: 0,
                                created_by: user_id,
                                status: 0,
                                created_at: new Date(),
                                updated_at: new Date(),
                              };
                            }
                          });

                          await insertManyBulk(
                            COLLECTION.CATEGORY_META,
                            row,
                            (status, message, result) => {
                              res.json({
                                status: status,
                                message: message,
                                result: result,
                              });
                            }
                          );
                        } else {
                          let body = csvrow.map((item) => ({
                            product_nm: item.product_nm,
                            price: item.price,
                            code: item.code,
                            cost: item.cost,
                            weight: item.weight,
                            prd_desc: item.prd_desc,
                            taxable: item.taxable,
                            cat_id: 0,
                            created_by: user_id,
                            status: 0,
                            created_at: new Date(),
                            updated_at: new Date(),
                          }));

                          await insertManyBulk(
                            COLLECTION.PRODUCT,
                            body,
                            (status, message, result) => {
                              res.json({
                                status: status,
                                message: message,
                                result: result,
                              });
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          } else {
            res.json({
              status: false,
              message: RESPONSE.UPLOAD_ERROR,
              result: [],
            });
          }
        } else {
          res.json({ status: false, message: RESPONSE.NOT_FOUND, result: [] });
        }
      });
  }
);

router.post(
  API.ADMIN.PRODUCT.SEND_PRODUCT_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.PRODUCT, async (status, message, result1) => {
      if (status && result1.length > 0) {
        let row = [];

        let filter = {
          _id: {
            $not: {
              $in: result1.map((item) => ({
                _id: new ObjectId(item.cat_id),
              })),
            },
          },
        };

        viewAll(
          filter,
          COLLECTION.CATEGORY,
          async (status, message, result) => {
            if (
              result !== null &&
              result !== undefined &&
              result !== "" &&
              result.length > 0
            ) {
              row = result1.map((item) => {
                if (
                  result.find(
                    (item2) => item.cat_id.toString() == item2._id.toString()
                  ) !== undefined
                ) {
                  return {
                    product_nm: item.product_nm,
                    price: item.price,
                    code: item.code,
                    cost: item.cost,
                    weight: item.weight,
                    prd_desc: item.prd_desc,
                    taxable: item.taxable,
                    category_nm: result.find(
                      (item2) => item.cat_id.toString() === item2._id.toString()
                    ).category_nm,
                  };
                } else {
                  return {
                    product_nm: item.product_nm,
                    price: item.price,
                    code: item.code,
                    cost: item.cost,
                    weight: item.weight,
                    prd_desc: item.prd_desc,
                    taxable: item.taxable,
                    category_nm: "",
                  };
                }
              });

              const json2csv = new Parser({
                fields: [
                  "category_nm",
                  "product_nm",
                  "code",
                  "price",
                  "cost",
                  "weight",
                  "taxable",
                  "prd_desc",
                ],
              });
              const csv = json2csv.parse(row);
              res.send(csv);
            } else {
              row = result1.map((item) => ({
                product_nm: item.product_nm,
                price: item.price,
                code: item.code,
                cost: item.cost,
                weight: item.weight,
                prd_desc: item.prd_desc,
                taxable: item.taxable,
                category_nm: "",
              }));

              const json2csv = new Parser({
                fields: [
                  "category_nm",
                  "product_nm",
                  "code",
                  "price",
                  "cost",
                  "weight",
                  "taxable",
                  "prd_desc",
                ],
              });
              const csv = json2csv.parse(row);
              res.send(csv);
            }
          }
        );
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
