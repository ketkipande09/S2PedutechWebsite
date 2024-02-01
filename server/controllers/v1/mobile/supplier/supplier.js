const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const UserHelper = require("../../../../models/helpers/user.helpers");
const Supplier = require("../../../../models").Supplier;
const User = require("../../../../models").User;

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");
const db = require("../../../../models");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const supplierObj = {
    //** view Supplier */
    viewSupplier: async (req, res) => {
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
                attributes: [
                    "id",
                    "email",
                    "name",
                    "status",
                    "mobileCode",
                    "mobileNumber",
                    "countryCode",
                    "countryName",
                    "location",
                    "locationPoint",
                    "banner",
                    "city",
                    "state",
                    "pincode",
                    "createdAt",
                    "updatedAt",

                ],
            };
            let existingSupplier = await Supplier.findOne(query);

            let queryUser ={
  
                where : {
                    supplierId : existingSupplier.id
                },
                attributes:['id','supplierId','userName','firstName','lastName']
            }
            let existingUser = await User.findAll(queryUser);

            let data ={
                Supplier : existingSupplier,
                User : existingUser
            }

            return res.json(generateResponse(resCode.HTTP_OK, data));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
        //**  update supplier *//
        update: async (req, res) => {
            try {
                req.assert("name", "Please enter valid name").optional();
                req.assert("location", "Please enter valid Location").notEmpty();
                req.assert("pincode", "Please enter valid pincode").notEmpty();
                req.assert("firstName", "First Name cannot be blank").notEmpty();
                req.assert("lastName", "Last Name cannot be blank").notEmpty();
                req.assert("mobileNumber", "Please enter Valid Mobile Number").notEmpty();
                req.assert("mobileCode", "Mobile code is compulsory").notEmpty();
                req.assert("email", "Email is not required").notEmpty();
                req.assert("city", "City is not compulsory").notEmpty();
                req.assert("state", "State is not compulsory").notEmpty();
                req.assert("countryName", "Country name is not compulsory").notEmpty();
                req.assert("countryCode", "Country code is not compulsory").optional();
                req.assert("gender", "Gender is not compulsory").optional();
    
                let errors = req.validationErrors();
    
                if (errors) {
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
                }
    
                let querySupplier = {
                    where: {
                        status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                        id: req.params.id,
                    },
                };
                let existingSupplier = await Supplier.findOne(querySupplier);
                let queryUser = {
                    where: {
                        status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                        supplierId: existingSupplier.id,
                    },
                };
    
                let existingUser = await User.findOne(queryUser);
    
                if (!existingUser || !existingSupplier) {
                    let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The supplier");
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
                } else {
                    if (req.body.firstName) {
                        existingUser.firstName = req.body.firstName;
                    }
                    if (req.body.lastName) {
                        existingUser.lastName = req.body.lastName;
                    }
                    if (req.body.gender) {
                        existingUser.gender = req.body.gender;
                    }
                    if (req.body.name) {
                        existingSupplier.name = req.body.name;
                    }
                    if (req.body.countryName) {
                        existingSupplier.countryName = req.body.countryName;
                        existingUser.countryName = req.body.countryName;
                    }
                    if (req.body.countryCode) {
                        existingSupplier.countryCode = req.body.countryCode;
                        existingUser.countryCode = req.body.countryCode;
                    }
                    if (req.body.pincode) {
                        existingSupplier.pincode = req.body.pincode;
                        existingUser.pincode = req.body.pincode;
                    }
                    if (req.body.location) {
                        existingSupplier.location = req.body.location;
                        existingUser.location = req.body.location;
                    }
                    if (req.body.mobileCode) {
                        existingSupplier.mobileCode = req.body.mobileCode;
                        existingUser.mobileCode = req.body.mobileCode;
                    }
                    if (req.body.mobileNumber) {
                        existingSupplier.mobileNumber = req.body.mobileNumber;
                        existingUser.mobileNumber = req.body.mobileNumber;
                    }
                    if (req.body.city) {
                        existingSupplier.city = req.body.city;
                        existingUser.city = req.body.city;
                    }
                    if (req.body.state) {
                        existingSupplier.state = req.body.state;
                        existingUser.state = req.body.state;
                    }
                    if (req.body.email) {
                        existingSupplier.email = req.body.email;
                        existingUser.email = req.body.email;
                    }
                    await existingUser.save();
                    await existingSupplier.save();
    
                    return res.json(
                        generateResponse(resCode.HTTP_OK, {
                            message: MESSAGES.apiSuccessStrings.UPDATE("The supplier"),
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
};

module.exports = supplierObj;