const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const attributeOptionSchema = require("../../../schema/aogproviderbe/attributes_options");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");
const {
  findAttribute,
  findAllAttribute,
} = require("../../../modules/csv_modules");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.ATTRIBUTES_OPTION.ADD_ATTRIBUTES_OPTION,
  validate(attributeOptionSchema.addAttributeOptionSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, price, cost, attr_id, user_id } = req.body;

    const body = {
      prompt: prompt,
      code: code,
      image: image,
      price: price,
      cost: cost,
      attr_id: new ObjectId(attr_id),
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { prompt: prompt, attr_id: new ObjectId(attr_id) },
      COLLECTION.ATTRIBUTES_OPTION,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: RESPONSE.DATA });
        } else {
          insert(
            body,
            COLLECTION.ATTRIBUTES_OPTION,
            (status1, message1, result1) => {
              res.json({
                status: status1,
                message: message1,
                result: result1,
              });
            }
          );
        }
      }
    );
  }
);

router.post(
  API.ADMIN.ATTRIBUTES_OPTION.VIEW_ATTRIBUTES_OPTION,
  validate(universal.viewAdminSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { limit, startingAfter, searchKeyWord } = req.body;

    if (
      searchKeyWord === undefined ||
      searchKeyWord === null ||
      searchKeyWord === ""
    ) {
      viewInPagination(
        {},
        startingAfter,
        limit,
        COLLECTION.ATTRIBUTES_OPTION,
        (status, message, result) => {
          if (result.length) {
            if (result[0].result.length) {
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
        [
          { $sort: { _id: -1 } },
          {
            $lookup: {
              from: COLLECTION.ATTRIBUTES,
              localField: "attr_id",
              foreignField: "_id",
              as: "attribute",
            },
          },
          { $unwind: "$attribute" },
          {
            $match: {
              $or: [
                {
                  prompt: {
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
                  price: {
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
                {
                  "$attribute.prompt": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  "$attribute.code": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  "$attribute.attr_type": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
                {
                  "$attribute.label": {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
              ],
            },
          },
          {
            $project: {
              attribute: "$attribute.prompt",
              prompt: 1,
              code: 1,
              image: 1,
              price: 1,
              cost: 1,
              attr_id: 1,
            },
          },
          {
            $facet: {
              result: [
                { $skip: parseInt(startingAfter) },
                { $limit: parseInt(limit) },
              ],
              total: [{ $count: "total" }],
            },
          },
        ],
        COLLECTION.ATTRIBUTES_OPTION,
        (status, message, result) => {
          if (result.length) {
            if (result[0].result.length) {
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
  API.ADMIN.ATTRIBUTES_OPTION.EDIT_ATTRIBUTES_OPTION,
  validate(attributeOptionSchema.editAttributeOptionSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, price, cost, attr_id, option_id } = req.body;

    const body = {
      $set: {
        prompt: prompt,
        code: code,
        image: image,
        price: price,
        cost: cost,
        attr_id: new ObjectId(attr_id),
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(option_id) },
      COLLECTION.ATTRIBUTES_OPTION,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(option_id) },
            body,
            COLLECTION.ATTRIBUTES_OPTION,
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
  API.ADMIN.ATTRIBUTES_OPTION.DELETE_ATTRIBUTES_OPTION,
  validate(attributeOptionSchema.deleteAttributeOptionSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { option_id } = req.body;

    view(
      { _id: new ObjectId(option_id) },
      COLLECTION.ATTRIBUTES_OPTION,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(option_id) },
            COLLECTION.ATTRIBUTES_OPTION,
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
  API.ADMIN.ATTRIBUTES_OPTION.ADD_ATTRIBUTES_OPTION_FROM_CSV,
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
            csvrow[0].hasOwnProperty("prompt") &&
            csvrow[0].hasOwnProperty("code") &&
            csvrow[0].hasOwnProperty("image") &&
            csvrow[0].hasOwnProperty("price") &&
            csvrow[0].hasOwnProperty("cost") &&
            csvrow[0].hasOwnProperty("attribute_prompt")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.prompt === "" ||
                item.code === "" ||
                item.price === "" ||
                item.cost === "" ||
                item.attribute_prompt === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.prompt === "" ||
                  item.code === "" ||
                  item.price === "" ||
                  item.cost === "" ||
                  item.attribute_prompt === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.prompt === "" ||
                valid.code === "" ||
                valid.price === "" ||
                valid.cost === "" ||
                valid.attribute_prompt === "")
            ) {
              res.json({
                status: false,
                message: `In line ${validIndex} some paramter is missing`,
                result: [],
              });
            } else {
              let row = [];
              let filter = {
                prompt: {
                  $in: csvrow.map((item) => item.prompt),
                },
              };

              viewAll(
                filter,
                COLLECTION.ATTRIBUTES_OPTION,
                async (status, message, result) => {
                  if (status && result.length > 0) {
                    row = csvrow.filter(
                      (item) =>
                        !result.find((item2) => item.prompt === item2.prompt)
                    );

                    if (
                      row !== undefined &&
                      row !== null &&
                      row !== "" &&
                      row.length > 0
                    ) {
                      let filter = {
                        prompt: {
                          $in: row.map((item) => item.attribute_prompt),
                        },
                      };

                      findAttribute(
                        COLLECTION.ATTRIBUTES,
                        filter,
                        row,
                        (rows) => {
                          insetEverything(rows);
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
                      prompt: {
                        $in: csvrow.map((item) => item.attribute_prompt),
                      },
                    };

                    findAttribute(
                      COLLECTION.ATTRIBUTES,
                      filter,
                      row,
                      (rows) => {
                        insetEverything(rows);
                      }
                    );
                  }
                }
              );

              async function insetEverything(rows) {
                let body = rows.map((item) => ({
                  prompt: item.prompt,
                  code: item.code,
                  image: item.image,
                  price: item.price,
                  cost: item.cost,
                  attr_id: item.attr_id,
                  created_at: new Date(),
                  created_by: user_id,
                  updated_at: new Date(),
                }));

                await insertManyBulk(
                  COLLECTION.ATTRIBUTES_OPTION,
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
  API.ADMIN.ATTRIBUTES_OPTION.SEND_ATTRIBUTES_OPTION_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll(
      {},
      COLLECTION.ATTRIBUTES_OPTION,
      async (status, message, result) => {
        if (status && result.length > 0) {
          let filter = {
            _id: {
              $in: result.map((item) => new ObjectId(item.attr_id)),
            },
          };

          findAllAttribute(COLLECTION.ATTRIBUTES, filter, result, (rows) => {
            if (rows !== undefined && rows !== null && rows.length) {
              const json2csv = new Parser({
                fields: [
                  "prompt",
                  "code",
                  "image",
                  "price",
                  "cost",
                  "attribute_prompt",
                ],
              });
              const csv = json2csv.parse(rows);
              res.send(csv);
            } else {
              res.send(RESPONSE.NOT_FOUND);
            }
          });
        } else {
          res.send(RESPONSE.NOT_FOUND);
        }
      }
    );
  }
);

module.exports = router;
