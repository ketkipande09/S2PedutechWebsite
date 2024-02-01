const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const ShopInventory = require("../../../../models").ShopInventory;
const Category = require("../../../../models").Category;
const Product = require("../../../../models").Product;
const db = require("../../../../models");

const {OPTIONS, generateResponse, generateURl} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const shopInvObj = {
    //** listing category of a shop */
    categoryListing: async (req, res) => {
        try {
            let shopId = req.user.shopId ? req.user.shopId : req.query.shopId;
            let offset = parseInt(req.query.start) || 0;
            let limit = parseInt(req.query.limit) || 10;
            let order = req.query.order;
            let search = req.query.search;
            let status = req.query.status;

            let whereQuery = `(s.status = '${OPTIONS.defaultStatus.ACTIVE}')`;
            if (status && status.length > 0 && status !== "all") {
                status = status.join("','");
                status = `'${status}'`;
                whereQuery = `(s.status IN (${status}) )`;
            }
            if (search && search && search.length > 0) {
                whereQuery += ` AND (c.name LIKE '%${search}%')`;
            }
            if (order && order.length > 0) {
                order = order;
            } else {
                order = `c.name ASC`;
            }
            let coreQuery = `SELECT c.id,c.name,c.image,COUNT(s.id) as itemCount,s.status,c.createdAt FROM Category c LEFT JOIN ShopInventory s ON s.categoryId = c.id AND s.shopId=${shopId} WHERE ${whereQuery}`;
            let groupQuery = `GROUP BY c.id,c.name,c.image,s.status`;
            const queryCoreOrder = `${coreQuery} ${groupQuery} ORDER BY ${order}`;
            const query = `${queryCoreOrder} LIMIT ${limit} OFFSET ${offset};`;

            console.log(query);

            const rows = await db.sequelize.query(query, {
                type: db.sequelize.QueryTypes.SELECT,
            });

            let outputData = {};

            let data = [];
            if (rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    let rowData = rows[i];
                    if (!rowData) continue;
                    let row = {
                        id: rowData.id,
                        name: rowData.name,
                        itemCount: rowData.itemCount,
                        status: rowData.status,
                        createdAt: rowData.createdAt,
                        image: generateURl(rowData.image),
                    };
                    data.push(row);
                }
            }
            outputData = data;
            return res.json(generateResponse(resCode.HTTP_OK, outputData));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** listing product of a shop vie category id */
    productListing: async (req, res) => {
        try {
            let order = [];
            if (req.query.order) {
                order.push(JSON.parse(req.query.order));
            } else {
                order.push(["createdAt", "desc"]);
            }
            let shopId = req.user.shopId ? req.user.shopId : req.query.shopId;
            let categoryId = req.query.categoryId;

            let start = parseInt(req.query.start) || 0;
            let limit = parseInt(req.query.limit) || 10;
            let whereQuery = {
                status: OPTIONS.defaultStatus.ACTIVE,
                shopId: shopId,
                categoryId: categoryId,
            };
            if (req.query.search) {
                whereQuery["name"] = {[Op.like]: "%" + req.query.search + "%"};
            }
            let query = {
                where: whereQuery,
                include: [
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                ],
                offset: start,
                limit: limit,
                order: order,
            };
            let productListing = await ShopInventory.findAll(query);

            return res.json(generateResponse(resCode.HTTP_OK, productListing));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** view Shop Inventory */
    viewShopInventory: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res.status(resCode.HTTP_BAD_REQUEST).json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }
            let query = {
                where: {
                    id: id,
                },
                include: [
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: db.Product,
                        as: "product",
                        attributes: ["id", "name"],
                    },
                ],
                attributes: [
                    "id",
                    "name",
                    "description",
                    "units",
                    "sellingUnits",
                    "unitType",
                    "image",
                    "quantity",
                    "createdAt",
                    "updatedAt",
                    "status",
                    "productCode",
                    "discountPercentage",
                    "type",
                    "inStock",
                    "showPrice",
                ],
            };
            let existingShopInventory = await ShopInventory.findOne(query);

            return res.json(generateResponse(resCode.HTTP_OK, existingShopInventory));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** Create Shop Inventory */
    create: async (req, res) => {
        try {
            req.assert("name", "Please enter name").notEmpty();
            req.assert("description", "Description is not compulsory").optional();
            req.assert("image", "Image is not compulsory").optional();
            req.assert("units", "Units is compulsory").notEmpty();
            req.assert("sellingUnits", "Selling units is compulsory").notEmpty();
            req.assert("unitType", " Unit type is compulsory").notEmpty();
            req.assert("price", "Price is compulsory").notEmpty();
            req.assert("productCode", "Product Code is compulsory").notEmpty();
            req.assert("discountPercentage", "Discount percentage is compulsory").notEmpty();
            req.assert("shopId", "Shop id is compulsory").optional();
            req.assert("categoryId", "Category id is compulsory").notEmpty();
            req.assert("productId", "Product id is compulsory").notEmpty();
            req.assert("quantity", "Quantity is compulsory").notEmpty();
            req.assert("inStock", "InStock is must be true or false").isBoolean(
                flag => flag === true || flag === false
            );
            req.assert("showPrice", "Show price is must be true or false").isBoolean(
                flag => flag === true || flag === false
            );
            let shopId = req.user.shopId ? req.user.shopId : req.body.shopId;
            let errors = req.validationErrors();
            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let shopInventory = await ShopInventory.create({
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                units: req.body.units,
                sellingUnits: req.body.sellingUnits,
                price: req.body.price,
                unitType: req.body.unitType,
                quantity: req.body.quantity,
                showPrice: req.body.showPrice,
                productCode: req.body.productCode,
                discountPercentage: req.body.discountPercentage,
                inStock: req.body.inStock,
                shopId: shopId,
                categoryId: req.body.categoryId,
                productId: req.body.productId,
            });
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The shop inventory`),
                })
            );
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** Update shop Inventory */
    update: async (req, res) => {
        try {
            req.assert("name", "Please enter name").notEmpty();
            req.assert("description", "Description is not compulsory").optional();
            req.assert("image", "Image is not compulsory").optional();
            req.assert("units", "Units is compulsory").notEmpty();
            req.assert("sellingUnits", "Selling units is compulsory").notEmpty();
            req.assert("unitType", " Unit type is compulsory").notEmpty();
            req.assert("price", "Price is compulsory").notEmpty();
            req.assert("productCode", "Product Code is compulsory").notEmpty();
            req.assert("discountPercentage", "Discount percentage is compulsory").notEmpty();
            req.assert("shopId", "Shop id is compulsory").optional();
            req.assert("categoryId", "Category id is compulsory").notEmpty();
            req.assert("productId", "Product id is compulsory").notEmpty();
            req.assert("quantity", "Quantity is compulsory").notEmpty();
            req.assert("inStock", "InStock is must be true or false").isBoolean(
                flag => flag === true || flag === false
            );
            req.assert("showPrice", "Show price is must be true or false").isBoolean(
                flag => flag === true || flag === false
            );
            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    id: req.params.id,
                },
            };

            let shopInventory = await ShopInventory.findOne(query);

            if (!shopInventory) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The shop inventory");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            } else {
                if (req.body.image && req.body.image !== shopInventory.image) {
                    shopInventory.image = req.body.image;
                }
                if (req.body.description) {
                    shopInventory.description = req.body.description;
                }
                if (req.body.units) {
                    shopInventory.units = req.body.units;
                }
                if (req.body.sellingUnits) {
                    shopInventory.sellingUnits = req.body.sellingUnits;
                }
                if (req.body.unitType) {
                    shopInventory.unitType = req.body.unitType;
                }
                if (req.body.price) {
                    shopInventory.price = req.body.price;
                }
                if (req.body.quantity) {
                    shopInventory.quantity = req.body.quantity;
                }
                if (req.body.productCode) {
                    shopInventory.productCode = req.body.productCode;
                }
                if (req.body.discountPercentage) {
                    shopInventory.discountPercentage = req.body.discountPercentage;
                }
                shopInventory.showPrice = req.body.showPrice;
                shopInventory.inStock = req.body.inStock;

                await shopInventory.save();

                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE("The shop inventory"),
                    })
                );
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** change status */
    changeStatus: async (req, res) => {
        try {
            let id = req.params.id;

            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res.status(resCode.HTTP_BAD_REQUEST).json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }

            let query = {
                where: {
                    id: id,
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                },
            };

            let existingShopInventory = await ShopInventory.findOne(query);
            if (!existingShopInventory) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The shop inventory");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            existingShopInventory.status =
                existingShopInventory.status === OPTIONS.defaultStatus.ACTIVE
                    ? OPTIONS.defaultStatus.INACTIVE
                    : OPTIONS.defaultStatus.ACTIVE;
            await existingShopInventory.save();

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE(
                        "The shop inventory",
                        existingShopInventory.status
                    ),
                })
            );
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** change stock */
    changeStock: async (req, res) => {
        try {
            let id = req.params.id;

            let query = {
                where: {
                    id: id,
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                },
            };

            let existingShopInventory = await ShopInventory.findOne(query);
            if (!existingShopInventory) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The shop inventory");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            existingShopInventory.inStock = existingShopInventory.inStock === true ? false : true;
            await existingShopInventory.save();

            if (existingShopInventory.inStock) {
                res.status(resCode.HTTP_OK).json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.STOCK_CHANGE("in stock"),
                    })
                );
            }
            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STOCK_CHANGE("out of stock"),
                })
            );
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
};

module.exports = shopInvObj;
