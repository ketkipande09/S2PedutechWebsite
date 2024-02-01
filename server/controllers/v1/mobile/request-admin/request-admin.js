const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const db = require("../../../../models");
const ProductHelper = require("../../../../models/helpers/product.helper");
const Category = require("../../../../models").Category;
const Product = require("../../../../models").Product;
const RequestAdmin = require("../../../../models").RequestAdmin;

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const requestAdminObj = {
	//** listing request admin for a shop */
    listing: async (req, res) => {
        try {
           
            let shopId = req.user.shopId;
            let start = req.query.start || 0;
            let limit = req.query.limit || 10;
            let query = {

                where: {
                    status : [OPTIONS.defaultStatus.APPROVED,OPTIONS.defaultStatus.UNAPPROVED],
                    shopId: shopId
                },
                order: [["createdAt", "DESC"]],
                offset: start,
                limit: limit,
            };
            let requestAdminList = await RequestAdmin.findAll(query);
            return res.json(generateResponse(resCode.HTTP_OK, requestAdminList));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** Request admin creation*/
    create: async (req, res) => {
        try {
            req.assert("name", "Please enter name").notEmpty();
            req.assert("description", "Description is not compulsory").optional();
            req.assert("image", "Image is not compulsory").optional();
            req.assert("type", "Type is compulsory").notEmpty();
            req.assert("shopId", "Shop id is compulsory").notEmpty();

            if (req.body.type === OPTIONS.modal.PRODUCT) {
                req.assert("categoryId", "Category id is compulsory").notEmpty();
            }
            let errors = req.validationErrors();
            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let requestAdmin = await RequestAdmin.create({
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                type: req.body.type,
                shopId: req.body.shopId,
                categoryId: req.body.categoryId,
            });
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The Request`),
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
    //** Request-Admin status delete */
    delete: async (req, res) => {
        try {
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.UNAPPROVED],
                    id: req.params.id,
                },
            };
            let RequestedAdmin = await RequestAdmin.findOne(query);
            if (RequestedAdmin) {
                RequestedAdmin.status = OPTIONS.defaultStatus.DELETED;
                await RequestedAdmin.save();
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.DELETED(" The Request"),
                    })
                );
            } else {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The Request");
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

module.exports = requestAdminObj;
