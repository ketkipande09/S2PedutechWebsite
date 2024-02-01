const sequelize = require("sequelize");
const FeedBack = require("../../../../models").FeedBack;
const db = require("../../../../models");
const moment = require("moment");
const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const roles = OPTIONS.usersRoles;

const feedbackObj = {
    //* Create feedback  //
    create: async (req, res) => {
        try {
            req.assert("description", "Description is compulsory").notEmpty();
            req.assert("shopId", "shop Id is not compulsory").optional();
            req.assert("userId", "User Id is compulsory").notEmpty();
            req.assert("orderId", "Order Id is not compulsory").optional();

            let errors = req.validationErrors();
            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let feedback = await FeedBack.create({
                description: req.body.description,
                userId: req.body.userId,
                shopId: req.body.shopId,
                orderId: req.body.orderId,
            });
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The Feedback`),
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

module.exports = feedbackObj;
