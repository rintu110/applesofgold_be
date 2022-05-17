const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const filesvalidate = require("../../../validation/fileValidation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const attributeSchema = require("../../../schema/aogproviderbe/attributes");
const universal = require("../../../schema/universal");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { insert } = require("../../../mongo-qury/insertOne");
const { ObjectId } = require("mongodb");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { viewAll } = require("../../../mongo-qury/findAll");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");

const { API, COLLECTION, RESPONSE } = config;
const { LOCAL_ATTRIBUTES } = API.ADMIN;

router.post(
  LOCAL_ATTRIBUTES.CRUD_LOCAL_ATTRIBUTES_OPTION,
  validate(attributeSchema.addAttributeOptionSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { attr_options, attr_id } = req.body;

    const body = {
      $set: {
        attr_options: attr_options,
      },
    };

    update(
      { _id: new ObjectId(attr_id) },
      body,
      COLLECTION.LOCAL_ATTRIBUTES,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  LOCAL_ATTRIBUTES.ADD_LOCAL_ATTRIBUTES,
  validate(attributeSchema.addAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, attr_type, required, user_id, product_id } =
      req.body;

    const body = {
      prompt: prompt,
      code: code,
      image: image,
      attr_type: attr_type,
      required: required,
      attr_options: [],
      status: 0,
      created_at: new Date(),
      created_by: user_id,
      updated_at: new Date(),
    };

    insert(body, COLLECTION.LOCAL_ATTRIBUTES, (status, message, result) => {
      if (status) {
        let product_attr = {
          $push: {
            local_attribute: new ObjectId(result.insertedId),
          },
        };
        update(
          { _id: new ObjectId(product_id) },
          product_attr,
          COLLECTION.PRODUCT,
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
          message: RESPONSE.FAILED,
          result: result,
        });
      }
    });
  }
);

router.post(
  LOCAL_ATTRIBUTES.EDIT_LOCAL_ATTRIBUTES,
  validate(attributeSchema.editAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { prompt, code, image, attr_type, required, attribute_id } = req.body;

    const body = {
      $set: {
        prompt: prompt,
        code: code,
        image: image,
        attr_type: attr_type,
        required: required,
        updated_at: new Date(),
      },
    };

    update(
      { _id: new ObjectId(attribute_id) },
      body,
      COLLECTION.LOCAL_ATTRIBUTES,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  LOCAL_ATTRIBUTES.DELETE_LOCAL_ATTRIBUTES,
  validate(attributeSchema.deleteAttributeSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { attribute_id, product_id } = req.body;

    deleteOne(
      { _id: new ObjectId(attribute_id) },
      COLLECTION.LOCAL_ATTRIBUTES,
      (status, message, result) => {
        if (status) {
          let product_attr = {
            $pull: {
              local_attribute: new ObjectId(attribute_id),
            },
          };
          update(
            { _id: new ObjectId(product_id) },
            product_attr,
            COLLECTION.PRODUCT,
            (status, message, result) => {
              res.json({
                status: status,
                message: message,
                result: RESPONSE.DELETE,
              });
            }
          );
        } else {
          res.json({
            status: false,
            message: RESPONSE.FAILED,
            result: result,
          });
        }
      }
    );
  }
);

router.post(
  LOCAL_ATTRIBUTES.ADD_LOCAL_ATTRIBUTES_FROM_CSV,
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
            csvrow[0].hasOwnProperty("label") &&
            csvrow[0].hasOwnProperty("labelcode")
          ) {
            const valid = csvrow.find(
              (item) =>
                item.prompt === "" ||
                item.code === "" ||
                item.attr_type === "" ||
                item.label === "" ||
                item.labelcode === ""
            );

            const validIndex =
              csvrow.findIndex(
                (item) =>
                  item.prompt === "" ||
                  item.code === "" ||
                  item.attr_type === "" ||
                  item.label === "" ||
                  item.labelcode === ""
              ) + 2;

            if (
              valid !== undefined &&
              valid !== null &&
              valid !== "" &&
              (valid.prompt === "" ||
                valid.code === "" ||
                valid.attr_type === "" ||
                valid.label === "" ||
                valid.labelcode === "")
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
  LOCAL_ATTRIBUTES.SEND_LOCAL_ATTRIBUTES_TO_CSV,
  ensureAuthorisedAdmin,
  async (req, res) => {
    viewAll({}, COLLECTION.ATTRIBUTES, async (status, message, result) => {
      if (status && result.length > 0) {
        const json2csv = new Parser({
          fields: [
            "prompt",
            "code",
            "image",
            "attr_type",
            "label",
            "labelcode",
          ],
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
