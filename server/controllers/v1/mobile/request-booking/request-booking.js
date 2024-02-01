const sequelize = require("sequelize");
const bcrypt = require("bcrypt");

const RequestBooking = require("../../../../models").RequestBooking;
const RequestBookingItem = require("../../../../models").RequestBookingItem;
const User = require("../../../../models").User;

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");
const db = require("../../../../models");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const requestBookingObj = {
    //** listing booking */
    listing: async (req, res) => {
        try {
            let order = [];

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
                whereQuery[Op.or] = [
                    {firstName: req.query.search},
                    {lastName: req.query.search},
                    {mobileNumber: req.query.search},
                ];
            }
            if(shopId){
                whereQuery['shopId']=shopId;
            }
            let query = {
                include: [
                    {
                        model: db.RequestBooking,
                        as: "requestBooking",
                        attributes: ["id", "description", "image", "status", "reason", "createdAt"],
                        where:whereQuery,
                        include: [
                            {
                                model: db.User,
                                as: "user",
                                attributes: [
                                    "id",
                                    "userName",
                                    "firstName",
                                    "lastName",
                                    "pincode",
                                    "city",
                                    "mobileCode",
                                    "mobileNumber",
                                    "profilePicture",
                                ],
                            },
                        ],
                    },
                ],
                attributes: [[sequelize.fn("count", sequelize.col("requestBookingId")), "itemsCount"]],
                group: ["requestBookingId"],
                offset: start,
                limit: limit,
            };
            let requestList = await RequestBookingItem.findAll(query);
            return res.json(generateResponse(resCode.HTTP_OK, requestList));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
    //** view request booking */
    viewBookingRequest: async (req, res) => {
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
            let existingBooking = await RequestBooking.findOne(query);
            let queryItems = {
                where: {
                    requestBookingId: id,
                },
            };
            let existingItem = await RequestBookingItem.findAll(queryItems);
           
            let queryUser = {
                where: {
                    id: existingBooking.userId,
                },
                attributes: [
                    "id",
                    "firstName",
                    "lastName",
                    "email",
                    "mobileCode",
                    "mobileNumber",
                    "countryCode",
                    "countryName",
                    "city",
                    "state",
                    "pincode",
                    "createdAt"
                ],
            };
            let existingUser = await User.findOne(queryUser);

            let data = {
                id: existingBooking.id,
                status: existingBooking.status,
                description: existingBooking.description,
                reason: existingBooking.reason,
                image: existingBooking.image,
                requestBookingId: existingBooking.requestBookingId,
                shopId: existingBooking.shopId,
                createdAt: existingBooking.createdAt,
                updatedAt: existingBooking.updatedAt,
                items: existingItem,
                user : existingUser,
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
    // **Booking Request Creation */
    create: async (req, res) => {
        try {
            req.assert("description", "Description is not compulsory").optional();
            req.assert("image", "Image is not compulsory").optional();
            req.assert("shopId", "Shop id is compulsory").notEmpty();
            req.assert("userId", "User id is compulsory").notEmpty();
            req.assert("items", "Minimum item length should be 1").isLength({min: 1});
            req.assert("items.*.name", "Item name is compulsory").notEmpty();
            req.assert("items.*.description", "Description is not compulsory").optional();
            req.assert("items.*.quantity", "Quantity is compulsory").notEmpty();
            req.assert("items.*.unitType", "Unit type is compulsory").notEmpty();
            req.assert("items.*.shopInventoryId", "ShopInventory id is compulsory").notEmpty();

            let data = req.body;

            let requestBooking = await RequestBooking.create({
                description: req.body.description,
                image: req.body.image,
                shopId: req.body.shopId,
                userId: req.body.userId,
            });

            for (let i = 0; i < data.items.length; i++) {
                let obj = {
                    shopInventoryId: data.items[i].shopInventoryId,
                    name: data.items[i].name,
                    quantity: data.items[i].quantity,
                    unitType: data.items[i].unitType,
                    description: data.items[i].description,
                    requestBookingId: requestBooking.id,
                };
                await RequestBookingItem.create(obj);
            }

            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The booking request`),
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
    //** update RequestBookingItems */
    updateItem: async (req, res) => {
        try {
            req.assert("description", "Description is not compulsory").optional();
            req.assert("name", " Name is compulsory").notEmpty();
            req.assert("unitType", "Unit type is compulsory").notEmpty();
            req.assert("price", "Price is not compulsory").optional();
            req.assert("quantity", "Quantity is compulsory").notEmpty();

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
            let requestBookingItem = await RequestBookingItem.findOne(query);

            if (!requestBookingItem) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The booking item");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            } else {
                if (req.body.name) {
                    requestBookingItem.name = req.body.name;
                }
                if (req.body.description) {
                    requestBookingItem.description = req.body.description;
                }
                if (req.body.unitType) {
                    requestBookingItem.unitType = req.body.unitType;
                }
                if (req.body.quantity) {
                    requestBookingItem.quantity = req.body.quantity;
                }
                if (req.body.price) {
                    requestBookingItem.price = req.body.price;
                }
                await requestBookingItem.save();
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE("The booking item"),
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
    //** Requested Booking Item Change Status  //
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

            let existingRequestBookingItem = await RequestBookingItem.findOne(query);
            if (!existingRequestBookingItem) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The booking item");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }
            if (req.body.status === OPTIONS.defaultStatus.APPROVED) {
                existingRequestBookingItem.status = OPTIONS.defaultStatus.APPROVED;
                await existingRequestBookingItem.save();
            } else {
                existingRequestBookingItem.status = OPTIONS.defaultStatus.REJECTED;
                existingRequestBookingItem.reason = req.body.reason;
                await existingRequestBookingItem.save();
            }

            let status = existingRequestBookingItem.status === OPTIONS.defaultStatus.APPROVED
                    ? OPTIONS.defaultStatus.APPROVED
                    : OPTIONS.defaultStatus.REJECTED;
            await existingRequestBookingItem.save();

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

    //** Requested Booking Change Status  //
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

            let existingRequestBooking = await RequestBooking.findOne(query);
            if (!existingRequestBooking) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The booking request");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }
            existingRequestBooking.status =
            existingRequestBooking.status === OPTIONS.defaultStatus.APPROVED
                    ? OPTIONS.defaultStatus.UNAPPROVED
                    : OPTIONS.defaultStatus.APPROVED;
            await existingRequestBooking.save();

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE("The booking request", existingRequestBooking.status),
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

     //** delete requested Booking */
     delete: async (req, res) => {
        try {
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.APPROVED, OPTIONS.defaultStatus.UNAPPROVED],
                    id: req.params.id,
                },
            };
            let existingRequestBooking = await RequestBooking.findOne(query);
            if (existingRequestBooking) {
                existingRequestBooking.status = OPTIONS.defaultStatus.DELETED;

                await existingRequestBooking.save();
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.DELETED("The booking request"),
                    })
                );
            } else {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The booking request");
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

module.exports = requestBookingObj;
