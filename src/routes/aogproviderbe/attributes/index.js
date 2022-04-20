const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const attributeSchema = require("../../../schema/aogproviderbe/attributes");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const { viewInPagination } = require("../../../mongo-qury/viewInPagination");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.ATTRIBUTES.ADD_ATTRIBUTES,
  validate(attributeSchema.addAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, attr_type, label, user_id } = req.body;

    const body = {
      prompt: prompt,
      code: code,
      image: image,
      attr_type: attr_type,
      label: label,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    view(
      { prompt: prompt },
      COLLECTION.ATTRIBUTES,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: RESPONSE.DATA });
        } else {
          insert(body, COLLECTION.ATTRIBUTES, (status1, message1, result1) => {
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
  API.ADMIN.ATTRIBUTES.VIEW_ATTRIBUTES,
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
        COLLECTION.ATTRIBUTES,
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
      viewInPagination(
        {
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
              attr_type: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
            {
              label: {
                $regex: searchKeyWord,
                $options: "i",
              },
            },
          ],
        },
        startingAfter,
        limit,
        COLLECTION.ATTRIBUTES,
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
  API.ADMIN.ATTRIBUTES.EDIT_ATTRIBUTES,
  validate(attributeSchema.editAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, attr_type, label, attribute_id } = req.body;

    const body = {
      $set: {
        prompt: prompt,
        code: code,
        image: image,
        attr_type: attr_type,
        label: label,
        updated_at: new Date(),
      },
    };

    view(
      { _id: new ObjectId(attribute_id) },
      COLLECTION.ATTRIBUTES,
      (status, message, result) => {
        if (status) {
          update(
            { _id: new ObjectId(attribute_id) },
            body,
            COLLECTION.ATTRIBUTES,
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
  API.ADMIN.ATTRIBUTES.DELETE_ATTRIBUTES,
  validate(attributeSchema.deleteAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { attribute_id } = req.body;

    view(
      { _id: new ObjectId(attribute_id) },
      COLLECTION.ATTRIBUTES,
      (status, message, result) => {
        if (status) {
          deleteOne(
            { _id: new ObjectId(attribute_id) },
            COLLECTION.ATTRIBUTES,
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
  API.ADMIN.ATTRIBUTES.ADD_ATTRIBUTES_FROM_CSV,
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
            csvrow[0].hasOwnProperty("attr_type") &&
            csvrow[0].hasOwnProperty("label")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.prompt === "" ||
                item.code === "" ||
                item.attr_type === "" ||
                item.label === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.prompt === "" ||
                  item.code === "" ||
                  item.attr_type === "" ||
                  item.label === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.prompt === "" ||
                valid.code === "" ||
                valid.attr_type === "" ||
                valid.label === "")
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
                COLLECTION.ATTRIBUTES,
                (status, message, result) => {
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
                      let body = row.map((items) => ({
                        ...items,
                        created_at: new Date(),
                        created_by: user_id,
                        updated_at: new Date(),
                      }));

                      insertManyBulk(
                        COLLECTION.ATTRIBUTES,
                        body,
                        (status, message, result) => {
                          res.json({
                            status: status,
                            message: message,
                            result: result,
                          });
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
                    let body = csvrow.map((items) => ({
                      ...items,
                      created_at: new Date(),
                      created_by: user_id,
                      updated_at: new Date(),
                    }));

                    insertManyBulk(
                      COLLECTION.ATTRIBUTES,
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
  API.ADMIN.ATTRIBUTES.SEND_ATTRIBUTES_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.ATTRIBUTES, async (status, message, result) => {
      if (status && result.length > 0) {
        const json2csv = new Parser({
          fields: ["prompt", "code", "image", "attr_type", "label"],
        });
        const csv = json2csv.parse(result);
        res.send(csv);
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
