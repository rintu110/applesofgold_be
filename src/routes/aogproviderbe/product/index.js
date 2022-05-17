const router = require("../../../app");
const config = require("../../../config/config");
const validate = require("../../../validation");
const { ensureAuthorisedAdmin } = require("../../../auth");
const filesvalidate = require("../../../validation/fileValidation");
const {
  addProductSchema,
  editProductSchema,
  deleteProductSchema,
  updateProductAttribute,
  updateProductGlobalAttribute,
  viewProductAttribute,
} = require("../../../schema/aogproviderbe/product");
const universal = require("../../../schema/universal");
const { view } = require("../../../mongo-qury/viewOne");
const { insert } = require("../../../mongo-qury/insertOne");
const {
  viewInPaginationLookUp,
} = require("../../../mongo-qury/aggregateFindAllinPagination");
const { update } = require("../../../mongo-qury/updateOne");
const { deleteOne } = require("../../../mongo-qury/deleteOne");
const { deleteMany } = require("../../../mongo-qury/deleteMany");
const { viewAll } = require("../../../mongo-qury/findAll");
const { insertManyBulk } = require("../../../mongo-qury/bulkOperation");
const { updateMany } = require("../../../mongo-qury/updateMany");
const {
  findCategory,
  findAllCategory,
} = require("../../../modules/csv_modules");
const csvtojson = require("csvtojson");
const { Parser } = require("json2csv");
const { ObjectId } = require("mongodb");

const { API, COLLECTION, RESPONSE } = config;

router.post(
  API.ADMIN.PRODUCT.VIEW_GLOBAL_LOCAL_ATTRIBUTES,
  validate(viewProductAttribute),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { product_id } = req.body;

    viewInPaginationLookUp(
      [
        {
          $match: {
            _id: new ObjectId(product_id),
          },
        },
        {
          $lookup: {
            from: COLLECTION.LOCAL_ATTRIBUTES,
            let: { local_attribute_ids: "$local_attribute" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$local_attribute_ids"],
                  },
                },
              },
              {
                $addFields: {
                  sort: {
                    $indexOfArray: ["$$local_attribute_ids", "$_id"],
                  },
                },
              },
              { $sort: { sort: 1 } },
            ],
            as: "local_attributes",
          },
        },
        {
          $lookup: {
            from: COLLECTION.ATTRIBUTES,
            let: { global_attribute_id: "$global_attribute_ids" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$global_attribute_id"],
                  },
                },
              },
              {
                $addFields: {
                  sort: {
                    $indexOfArray: ["$$global_attribute_id", "$_id"],
                  },
                },
              },
              { $sort: { sort: 1 } },
            ],
            as: "global_attribute",
          },
        },
        {
          $project: {
            local_attributes: 1,
            global_attribute: 1,
            _id: 0,
          },
        },
      ],
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (result.length) {
          res.json({
            status: status,
            message: message,
            result: result[0],
          });
        } else {
          res.json({
            status: false,
            message: RESPONSE.NOT_FOUND,
            result: [],
          });
        }
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.ADD_PRODUCT,
  validate(addProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      user_id,
      product_name,
      sku,
      msrp,
      price,
      description,
      thumbnail_image,
      closeup_image,
      alternative_images,
      shipping_message_id,
      related_product_ids,
      category_ids,
      local_attribute,
      global_attribute_ids,
      country_id,
      gender,
      metaltype,
      weight,
      quantity,
    } = req.body;

    view(
      { product_name: product_name },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (status) {
          res.json({ status: false, message: RESPONSE.DATA });
        } else {
          local_attribute.length > 0 &&
            local_attribute.map((item) => ({
              prompt: item.prompt,
              code: item.code,
              image: item.image,
              attr_type: item.attr_type,
              required: item.required,
              attr_options: item.attr_options,
              status: 0,
              created_at: new Date(),
              created_by: user_id,
              updated_at: new Date(),
            }));

          if (local_attribute.length) {
            insertManyBulk(
              COLLECTION.LOCAL_ATTRIBUTES,
              local_attribute,
              (status1, message1, result1) => {
                if (status1) {
                  const body = {
                    product_name: product_name,
                    product_path: (product_name + "-" + sku + ".html")
                      .split(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
                      .join("-"),
                    sku: sku,
                    price: price,
                    msrp: msrp,
                    description: description,
                    thumbnail_image: thumbnail_image,
                    closeup_image: closeup_image,
                    alternative_images: alternative_images,
                    shipping_message_id: new ObjectId(shipping_message_id),
                    country_id: new ObjectId(country_id),
                    gender: gender,
                    metaltype: metaltype,
                    weight: weight,
                    quantity: quantity,
                    related_product_ids:
                      related_product_ids.length > 0
                        ? related_product_ids.map((item) => new ObjectId(item))
                        : [],
                    category_ids:
                      category_ids.length > 0
                        ? category_ids.map((item) => new ObjectId(item))
                        : [],
                    local_attribute: result1.result.insertedIds.map(
                      (item) => item._id
                    ),
                    global_attribute_ids:
                      global_attribute_ids.length > 0
                        ? global_attribute_ids.map((item) => new ObjectId(item))
                        : [],
                    created_by: user_id,
                    status: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                  };

                  insert(
                    body,
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
                  res.json({ status: false, message: RESPONSE.FAILED });
                }
              }
            );
          } else {
            const body = {
              product_name: product_name,
              product_path: (product_name + "-" + sku + ".html")
                .split(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
                .join("-"),
              sku: sku,
              price: price,
              msrp: msrp,
              description: description,
              thumbnail_image: thumbnail_image,
              closeup_image: closeup_image,
              alternative_images: alternative_images,
              shipping_message_id: new ObjectId(shipping_message_id),
              country_id: new ObjectId(country_id),
              gender: gender,
              metaltype: metaltype,
              weight: weight,
              quantity: quantity,
              related_product_ids:
                related_product_ids.length > 0
                  ? related_product_ids.map((item) => new ObjectId(item))
                  : [],
              category_ids:
                category_ids.length > 0
                  ? category_ids.map((item) => new ObjectId(item))
                  : [],
              local_attribute: [],
              global_attribute_ids:
                global_attribute_ids.length > 0
                  ? global_attribute_ids.map((item) => new ObjectId(item))
                  : [],
              created_by: user_id,
              status: 0,
              created_at: new Date(),
              updated_at: new Date(),
            };

            insert(body, COLLECTION.PRODUCT, (status, message, result) => {
              res.json({
                status: status,
                message: message,
                result: result,
              });
            });
          }
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
        [
          { $sort: { _id: -1 } },
          {
            $lookup: {
              from: COLLECTION.CATEGORY,
              let: { category_id: "$category_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$category_id"] },
                  },
                },
              ],
              as: "categories",
            },
          },
          {
            $lookup: {
              from: COLLECTION.LOCAL_ATTRIBUTES,
              let: { local_attribute_ids: "$local_attribute" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$local_attribute_ids"] },
                  },
                },
                {
                  $addFields: {
                    sort: {
                      $indexOfArray: ["$$local_attribute_ids", "$_id"],
                    },
                  },
                },
                { $sort: { sort: 1 } },
              ],
              as: "local_attributes",
            },
          },
          {
            $lookup: {
              from: COLLECTION.ATTRIBUTES,
              let: { global_attribute_id: "$global_attribute_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$global_attribute_id"] },
                  },
                },
                {
                  $addFields: {
                    sort: {
                      $indexOfArray: ["$$global_attribute_id", "$_id"],
                    },
                  },
                },
                { $sort: { sort: 1 } },
              ],
              as: "global_attributes",
            },
          },
          {
            $lookup: {
              from: COLLECTION.PRODUCT,
              let: { product_id: "$related_product_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$product_id"] },
                  },
                },
              ],
              as: "related_products",
            },
          },
          {
            $lookup: {
              from: COLLECTION.SHIPPING_MESSAGE,
              localField: "shipping_message_id",
              foreignField: "_id",
              as: "shipping_message",
            },
          },
          { $unwind: "$shipping_message" },
          {
            $lookup: {
              from: COLLECTION.COUNRTY,
              localField: "country_id",
              foreignField: "_id",
              as: "country",
            },
          },
          { $unwind: "$country" },
          {
            $facet: {
              result: [
                { $skip: parseInt(startingAfter) },
                { $limit: parseInt(limit) },
              ],
              total: [{ $count: "total" }],
            },
          },
          { $unwind: "$total" },
        ],
        COLLECTION.PRODUCT,
        (status, message, result) => {
          if (result.length) {
            if (result[0].result.length) {
              res.json({
                status: status,
                message: message,
                result: result[0].result,
                total: result[0].total.total,
              });
            } else {
              res.json({
                status: false,
                message: RESPONSE.NOT_FOUND,
                result: [],
                total: 0,
              });
            }
          } else {
            res.json({
              status: false,
              message: RESPONSE.NOT_FOUND,
              result: [],
              total: 0,
            });
          }
        }
      );
    } else {
      viewInPaginationLookUp(
        [
          {
            $match: {
              $or: [
                {
                  product_name: {
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
                  sku: {
                    $regex: searchKeyWord,
                    $options: "i",
                  },
                },
              ],
            },
          },
          { $sort: { _id: -1 } },
          {
            $lookup: {
              from: COLLECTION.CATEGORY,
              let: { category_id: "$category_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$category_ids", "$$category_id"] },
                  },
                },
              ],
              as: "categories",
            },
          },
          {
            $lookup: {
              from: COLLECTION.LOCAL_ATTRIBUTES,
              let: { local_attribute_ids: "$local_attribute" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$local_attribute_ids"] },
                  },
                },
                {
                  $addFields: {
                    sort: {
                      $indexOfArray: ["$$local_attribute_ids", "$_id"],
                    },
                  },
                },
                { $sort: { sort: 1 } },
              ],
              as: "local_attributes",
            },
          },
          {
            $lookup: {
              from: COLLECTION.ATTRIBUTES,
              let: { global_attribute_id: "$global_attribute_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$global_attribute_id"] },
                  },
                },
                {
                  $addFields: {
                    sort: {
                      $indexOfArray: ["$$global_attribute_id", "$_id"],
                    },
                  },
                },
                { $sort: { sort: 1 } },
              ],
              as: "global_attributes",
            },
          },
          {
            $lookup: {
              from: COLLECTION.PRODUCT,
              let: { product_id: "$related_product_ids" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$related_product_ids", "$$product_id"] },
                  },
                },
              ],
              as: "related_products",
            },
          },
          {
            $lookup: {
              from: COLLECTION.SHIPPING_MESSAGE,
              localField: "shipping_message_id",
              foreignField: "_id",
              as: "shipping_message",
            },
          },
          { $unwind: "$shipping_message" },
          {
            $lookup: {
              from: COLLECTION.COUNRTY,
              localField: "country_id",
              foreignField: "_id",
              as: "country",
            },
          },
          { $unwind: "$country" },
          {
            $facet: {
              result: [
                { $skip: parseInt(startingAfter) },
                { $limit: parseInt(limit) },
              ],
              total: [{ $count: "total" }],
            },
          },
          { $unwind: "$total" },
        ],
        COLLECTION.PRODUCT,
        (status, message, result) => {
          if (result.length) {
            if (result[0].result.length) {
              res.json({
                status: status,
                message: message,
                result: result[0].result,
                total: result[0].total.total,
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
  API.ADMIN.PRODUCT.UPDATE_PRODUCT_ATTRIBUTES,
  validate(updateProductAttribute),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { product_id, local_attribute } = req.body;

    const body = {
      $set: {
        local_attribute: local_attribute.map((item) => new ObjectId(item)),
      },
    };

    update(
      { _id: new ObjectId(product_id) },
      body,
      COLLECTION.PRODUCT,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.UPDATE_PRODUCT_GLOBAL_ATTRIBUTES,
  validate(updateProductGlobalAttribute),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { product_id, global_attribute_ids } = req.body;

    const body = {
      $set: {
        global_attribute_ids: global_attribute_ids.map(
          (item) => new ObjectId(item)
        ),
      },
    };

    update(
      { _id: new ObjectId(product_id) },
      body,
      COLLECTION.PRODUCT,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.EDIT_PRODUCT,
  validate(editProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const {
      product_name,
      sku,
      msrp,
      price,
      description,
      thumbnail_image,
      closeup_image,
      alternative_images,
      shipping_message_id,
      product_id,
      related_product_ids,
      category_ids,
      country_id,
      gender,
      metaltype,
      weight,
      quantity,
    } = req.body;

    const body = {
      $set: {
        product_name: product_name,
        price: price,
        sku: sku,
        product_path: (product_name + "-" + sku + ".html")
          .split(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
          .join("-"),
        msrp: msrp,
        description: description,
        thumbnail_image: thumbnail_image,
        closeup_image: closeup_image,
        alternative_images: alternative_images,
        shipping_message_id: new ObjectId(shipping_message_id),
        country_id: new ObjectId(country_id),
        gender: gender,
        metaltype: metaltype,
        weight: weight,
        quantity: quantity,
        related_product_ids:
          related_product_ids.length > 0
            ? related_product_ids.map((item) => new ObjectId(item))
            : [],
        category_ids:
          category_ids.length > 0
            ? category_ids.map((item) => new ObjectId(item))
            : [],
        updated_at: new Date(),
      },
    };

    update(
      { _id: new ObjectId(product_id) },
      body,
      COLLECTION.PRODUCT,
      (status, message, result) => {
        res.json({ status: status, message: message, result: result });
      }
    );
  }
);

router.post(
  API.ADMIN.PRODUCT.DELETE_PRODUCT,
  validate(deleteProductSchema),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { product_id, local_attribute } = req.body;

    deleteOne(
      { _id: new ObjectId(product_id) },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        if (status) {
          deleteMany(
            {
              $match: {
                _id: {
                  $in: [local_attribute.map((item) => new ObjectId(item))],
                },
              },
            },
            COLLECTION.LOCAL_ATTRIBUTES,
            (status, message, result) => {
              res.json({ status: status, message: message, result: result });
            }
          );
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
  validate(universal.searchAll),
  ensureAuthorisedAdmin,
  (req, res) => {
    const { searchKeyWord } = req.body;

    viewAll(
      {
        sku: { $regex: searchKeyWord, $options: "i" },
      },
      COLLECTION.PRODUCT,
      (status, message, result) => {
        res.json({
          status: status,
          message: message,
          result: result,
        });
      }
    );
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
      .then(async (csvrow) => {
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
              let filter = {
                product_nm: {
                  $in: csvrow.map((item) => item.product_nm),
                },
              };

              viewAll(
                filter,
                COLLECTION.PRODUCT,
                async (status, message, result) => {
                  if (status && result.length > 0) {
                    let row = [];

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
                          $in: row.map((item) => item.category_nm),
                        },
                      };

                      findCategory(COLLECTION.CATEGORY, filter, row, (rows) => {
                        insetEverything(rows);
                      });
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
                        $in: csvrow.map((item) => item.category_nm),
                      },
                    };

                    findCategory(
                      COLLECTION.CATEGORY,
                      filter,
                      csvrow,
                      (rows) => {
                        insetEverything(rows);
                      }
                    );
                  }
                }
              );

              async function insetEverything(row) {
                if (row !== undefined && row !== null && row.length) {
                  let body = row.map((item) => ({
                    product_nm: item.product_nm,
                    price: item.price,
                    code: item.code,
                    cost: item.cost,
                    weight: item.weight,
                    prd_desc: item.prd_desc,
                    taxable: item.taxable,
                    cat_id: item.cat_id,
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
    viewAll({}, COLLECTION.PRODUCT, async (status, message, result) => {
      if (status && result.length > 0) {
        let filter = {
          _id: {
            $in: result.map((item) => new ObjectId(item.cat_id)),
          },
        };

        findAllCategory(COLLECTION.CATEGORY, filter, result, (rows) => {
          if (rows !== undefined && rows !== null && rows.length) {
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
            const csv = json2csv.parse(rows);
            res.send(csv);
          } else {
            res.send(RESPONSE.NOT_FOUND);
          }
        });
      } else {
        res.send(RESPONSE.NOT_FOUND);
      }
    });
  }
);

module.exports = router;
