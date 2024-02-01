const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const RequestedSupplier = require("../../../../models").RequestedSupplier;
const RequestedSupplierItems = require("../../../../models").RequestedSupplierItems;
const Shop = require("../../../../models").Shop;
const Supplier = require("../../../../models").Supplier;
const User = require("../../../../models").User;
const UserHelper = require("../../../../models/helpers/user.helpers");
const Category = require("../../../../models").Category;
const Product = require("../../../../models").Product;
const db = require("../../../../models");

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");
const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const roles = OPTIONS.usersRoles;

const requestedSuppObj = {
    //** listing Supplier */
    listing: async (req, res) => {
        try {
            let order = [];
            let include = [];
            if (order.length === 0) {
                order.push(["createdAt", "DESC"]);
            }
            let shopId = req.user.shopId ? req.user.shopId : req.query.shopId;
            let start = req.query.start || 0;
            let limit = req.query.limit || 10;
            let whereQuery = {
                status: [OPTIONS.defaultStatus.UNAPPROVED, OPTIONS.defaultStatus.APPROVED],
            };
            if (req.query.search) {
                whereQuery[Op.or] = [{name: req.query.search}, {mobileNumber: req.query.search}];
            }
            if (shopId) {
                whereQuery["shopId"] = shopId;
            }
            if (req.user.role === OPTIONS.usersRoles.SUPPLIER) {
                whereQuery["supplierId"] = req.user.supplierId;
                include = [
                    {
                        model: db.Shop,
                        as: "shop",
                        attributes: ["id", "name", "email", "pincode", "city", "mobileCode", "mobileNumber"],
                    },
                ];
            } else {
                include = [
                    {
                        model: db.Supplier,
                        as: "supplier",
                        attributes: ["id", "name", "email", "pincode", "city", "mobileCode", "mobileNumber"],
                    },
                ];
            }
            let query = {
                include: [
                    {
                        model: db.RequestedSupplier,
                        as: "requestedSupplier",
                        attributes: [
                            "id",
                            "description",
                            "status",
                            "reason",
                            "createdAt",
                            "shopId",
                            "supplierId",
                            "total",
                        ],
                        where: whereQuery,
                        include: include,
                    },
                ],
                attributes: [[sequelize.fn("count", sequelize.col("requestedSupplierId")), "itemsCount"]],
                group: ["requestedSupplierId"],
                offset: start,
                limit: limit,
            };
            let requestSupplierList = await RequestedSupplierItems.findAll(query);
            return res.json(generateResponse(resCode.HTTP_OK, requestSupplierList));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    // ** Create requested supplier */
    create: async (req, res) => {
        try {
            req.assert("name", "Name is compulsory").notEmpty();
            req.assert("description", "Description is not compulsory").optional();
            req.assert("shopId", "Shop id is compulsory").notEmpty();
            req.assert("supplierId", "Supplier id is compulsory").notEmpty();
            req.assert("quantity", "Quantity  is compulsory").notEmpty();
            req.assert("unitType", "UnitType  is compulsory").notEmpty();
            req.assert("categoryId", "Category id is compulsory").notEmpty();
            req.assert("productId", "Product id is compulsory").notEmpty();

            let data = req.body;

            let requestedSupplier = await RequestedSupplier.create({
                name: req.body.name,
                description: req.body.description,
                shopId: req.body.shopId,
                supplierId: req.body.supplierId,
            });

            for (let i = 0; i < data.items.length; i++) {
                let obj = {
                    name: data.items[i].name,
                    description: data.items[i].description,
                    unitType: data.items[i].unitType,
                    quantity: data.items[i].quantity,
                    requestedSupplierId: requestedSupplier.id,
                    categoryId: data.items[i].categoryId,
                    productId: data.items[i].productId,
                };
                await RequestedSupplierItems.create(obj);
            }
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The supplier request`),
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

    //** change status requested supplier */
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
                    status: [OPTIONS.defaultStatus.UNAPPROVED,OPTIONS.defaultStatus.APPROVED],
                },
            };

            let existingRequestedSupplier = await RequestedSupplier.findOne(query);
            if (!existingRequestedSupplier) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The supplier request");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }
            existingRequestedSupplier.status =
            existingRequestedSupplier.status === OPTIONS.defaultStatus.APPROVED
                    ? OPTIONS.defaultStatus.UNAPPROVED
                    : OPTIONS.defaultStatus.APPROVED;
            await existingRequestedSupplier.save();

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE("The supplier request",existingRequestedSupplier.status),
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

    //** change status requested supplier */
    changeStatusItem: async (req, res) => {
        try {
            req.assert("status", "Please enter valid status").notEmpty();
            if (req.body.status === OPTIONS.defaultStatus.REJECTED) {
                req.assert("reason", "Please enter valid reason").notEmpty();
            }
            let id = req.params.id;

            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res.status(resCode.HTTP_BAD_REQUEST).json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }

            let query = {
                where: {
                    id: id,
                    status: [OPTIONS.defaultStatus.UNAPPROVED],
                },
            };

            let existingRequestedSupplierItems = await RequestedSupplierItems.findOne(query);
            if (!existingRequestedSupplierItems) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The supplier item");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            if (req.body.status === OPTIONS.defaultStatus.APPROVED) {
                existingRequestedSupplierItems.status = OPTIONS.defaultStatus.APPROVED;
                await existingRequestedSupplierItems.save();
            } else {
                existingRequestedSupplierItems.status = OPTIONS.defaultStatus.REJECTED;
                existingRequestedSupplierItems.reason = req.body.reason;
                await existingRequestedSupplierItems.save();
            }

            let status =
            existingRequestedSupplierItems.status === OPTIONS.defaultStatus.APPROVED
                ? OPTIONS.defaultStatus.APPROVED
                : OPTIONS.defaultStatus.REJECTED;
           

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE("",status).trim(),
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
    //** view request Supplier */
    viewSupplierRequest: async (req, res) => {
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
            };
            let existingRequestedSupplier = await RequestedSupplier.findOne(query);
            let queryItems = {
                where: {
                    requestedSupplierId: id,
                },
            };
            let existingRequestedSupplierItems = await RequestedSupplierItems.findAll(queryItems);

            let querySupplier = {
                where: {
                    id: existingRequestedSupplier.supplierId,
                },
                attributes: [
                    "id",
                    "email",
                    "name",
                    "mobileCode",
                    "mobileNumber",
                    "countryCode",
                    "countryName",
                    "city",
                    "state",
                    "pincode",
                    "createdAt",
                ],
            };
            let existingSupplier = await Supplier.findOne(querySupplier);
            let queryShop = {
                where: {
                    id: existingRequestedSupplier.shopId,
                },
                attributes: [
                    "id",
                    "email",
                    "name",
                    "mobileCode",
                    "mobileNumber",
                    "countryCode",
                    "countryName",
                    "city",
                    "state",
                    "pincode",
                    "createdAt",
                ],
            };
            let existingShop = await Shop.findOne(queryShop);
            let data = {
                id: existingRequestedSupplier.id,
                status: existingRequestedSupplier.status,
                description: existingRequestedSupplier.description,
                reason: existingRequestedSupplier.reason,
                supplierId: existingRequestedSupplier.supplierId,
                shopId: existingRequestedSupplier.shopId,
                total: existingRequestedSupplier.total,
                createdAt: existingRequestedSupplier.createdAt,
                updatedAt: existingRequestedSupplier.updatedAt,
                items: existingRequestedSupplierItems,
                supplier: existingSupplier,
                shop: existingShop,
            };

            return res.json(generateResponse(resCode.HTTP_OK, data));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** update requested supplier item */
    update: async (req, res) => {
        try {
            req.assert("name", "Name is compulsory").notEmpty();
            req.assert("description", "Description is not compulsory").optional();
            req.assert("quantity", "Quantity is compulsory").notEmpty();
            req.assert("unitType", "UnitType is compulsory").notEmpty();
            if (req.user.role === roles.SUPPLIER) {
                req.assert("price", "Price is compulsory").notEmpty();
            }

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.APPROVED, OPTIONS.defaultStatus.UNAPPROVED],
                    id: req.params.id,
                },
            };

            let requestedSupplierItems = await RequestedSupplierItems.findOne(query);

            if (!requestedSupplierItems) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The supplier item ");

                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            } else {
                if (req.body.name) {
                    requestedSupplierItems.name = req.body.name;
                }
                if (req.body.description) {
                    requestedSupplierItems.description = req.body.description;
                }
                if (req.body.unitType) {
                    requestedSupplierItems.unitType = req.body.unitType;
                }
                if (req.body.price) {
                    requestedSupplierItems.price = req.body.price;
                }
                if (req.body.quantity) {
                    requestedSupplierItems.quantity = req.body.quantity;
                }

                await requestedSupplierItems.save();

                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE("The supplier items "),
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

    //** delete requested supplier */
    delete: async (req, res) => {
        try {
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.APPROVED, OPTIONS.defaultStatus.UNAPPROVED],
                    id: req.params.id,
                },
            };
            let existingRequestedSupplier = await RequestedSupplier.findOne(query);
            if (existingRequestedSupplier) {
                existingRequestedSupplier.status = OPTIONS.defaultStatus.DELETED;

                await existingRequestedSupplier.save();
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.DELETED("The request"),
                    })
                );
            } else {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The request");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
};

module.exports = requestedSuppObj;
