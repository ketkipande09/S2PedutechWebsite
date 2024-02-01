const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const UserHelper = require("../../../../models/helpers/user.helpers");
const Supplier = require("../../../../models").Supplier;
const User = require("../../../../models").User;
const Shop = require("../../../../models").Shop;
const Employees = require("../../../../models").Employees;

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");
const db = require("../../../../models");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const shopObj = {
    //** Supplier Creation */
    supplierCreate: async (req, res) => {
        try {
            req.assert("firstName", "First name is compulsory").notEmpty();
            req.assert("lastName", "Last name is compulsory").notEmpty();
            req.assert("name", "Supplier name is compulsory").notEmpty();
            req.assert("mobileNumber", "Mobile number is compulsory").notEmpty();
            req.assert("mobileCode", "Mobile code is compulsory").notEmpty();
            req.assert("location", "Location is  compulsory").notEmpty();
            req.assert("countryName", "Country name is not compulsory").notEmpty();
            req.assert("countryCode", "Country code is not compulsory").notEmpty();
            req.assert("pincode", "Pincode is compulsory").notEmpty();
            req.assert("email", "Email is compulsory").notEmpty();
            req.assert("logo", "Logo is not compulsory").optional();
            req.assert("city", "City is not compulsory").notEmpty();
            req.assert("state", "State is not compulsory").notEmpty();
            req.assert("gender", "Gender is not compulsory").optional();
            req.assert("dob", "dob is not compulsory").optional();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    name: {[Op.like]: req.body.name},
                    mobileNumber: {[Op.like]: req.body.mobileNumber},
                },
            };

            let existingSupplier = await Supplier.findOne(query);
            if (existingSupplier) {
                let errors = MESSAGES.apiSuccessStrings.DATA_ALREADY_EXISTS("The supplier");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            }
            let newPassword = UserHelper.generateRandomPassword();
            let password = await bcrypt.hash(newPassword, bcrypt.genSaltSync(8));

            let user = await User.create({
                firstName: req.body.firstName,
                userName: await UserHelper.generateUniqueUsername(req.body.firstName),
                lastName: req.body.lastName,
                email: req.body.email,
                password: password,
                mobileCode: req.body.mobileCode,
                mobileNumber: req.body.mobileNumber,
                role: req.body.role,
                countryName: req.body.countryName,
                countryCode: req.body.countryCode,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                location: req.body.location,
                gender: req.body.gender,
                dob: req.body.dob,
            });
            let supplier = await Supplier.create({
                name: req.body.name,
                mobileNumber: req.body.mobileNumber,
                mobileCode: req.body.mobileCode,
                email: req.body.email,
                countryName: req.body.countryName,
                countryCode: req.body.countryCode,
                pincode: req.body.pincode,
                location: req.body.location,
                state: req.body.state,
                city: req.body.city,
                logo: req.body.logo,
            });

            await user.update({supplierId: supplier.id});

            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The supplier`),
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

    //** Supplier listing */
    supplierList: async (req, res) => {
        try {
            let shopId = req.user.shopId;
            let start = req.query.start || 0;
            let limit = req.query.limit || 10;
            let query = {
                where: {
                    shopId: shopId,
                    role: OPTIONS.usersRoles.SUPPLIER,
                },
                exclude: [
                    "changeEmail",
                    "websiteUrl",
                    "bio",
                    "verificationToken",
                    "passwordResetToken",
                    "passwordResetExpires",
                    "coverPicture",
                    "verificationTokenExpireAt",
                    "isEmailVerified",
                    "isMobileNumberVerified",
                    "google",
                    "facebook",
                    "socialProfilePicture",
                ],
                order: [["createdAt", "DESC"]],
                offset: start,
                limit: limit,
            };
            let supplierList = await Supplier.findAll(query);
            return res.json(generateResponse(resCode.HTTP_OK, supplierList));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** view Supplier */
    supplierView: async (req, res) => {
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
            let queryUser = {
                where: {
                    supplierId: existingSupplier.id,
                },
                attributes: ["id", "supplierId", "userName", "firstName", "lastName"],
            };
            let existingUser = await User.findAll(queryUser);

            let data = {
                Supplier: existingSupplier,
                User: existingUser,
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

    //** Employees change status  */
    supplierChangeStatus: async (req, res) => {
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
            let existingSupplier = await Supplier.findOne(query);
            let userQuery = {
                where: {
                    supplierId: existingSupplier.id,
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                },
            };
            let existingUser = await User.findOne(userQuery);
            if (!existingSupplier) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The supplier");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            existingSupplier.status =
                existingSupplier.status === OPTIONS.defaultStatus.ACTIVE
                    ? OPTIONS.defaultStatus.INACTIVE
                    : OPTIONS.defaultStatus.ACTIVE;
            await existingSupplier.save();

            existingUser.status = existingSupplier.status;
            await existingUser.save();

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE("The supplier", existingSupplier.status),
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

    //**  update supplier *//
    supplierUpdate: async (req, res) => {
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

    //** Update Shop Api*/
    shopUpdate: async (req, res) => {
        try {
            req.assert("userName", "User name is compulsory").optional();
            req.assert("firstName", "First Name is compulsory").notEmpty();
            req.assert("lastName", "Last Name is compulsory").notEmpty();
            req.assert("name", "Shop name is compulsory").optional();
            req.assert("mobileCode", "Mobile code is not compulsory").notEmpty();
            req.assert("mobileNumber", "Mobile number is compulsory").notEmpty();
            req.assert("pincode", "Pincode is compulsory").notEmpty();
            req.assert("location", "Location is not compulsory").notEmpty();
            req.assert("countryCode", "Country code is not compulsory").optional();
            req.assert("countryName", "Country name  is not compulsory").notEmpty();
            req.assert("city", "City is not compulsory").notEmpty();
            req.assert("state", "State is not compulsory").notEmpty();
            req.assert("email", "Email is not compulsory").notEmpty();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let userQuery = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    shopId: req.params.id,
                },
            };
            let shopQuery = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    id: req.params.id,
                },
            };

            let existingUser = await User.findOne(userQuery);
            let existingShop = await Shop.findOne(shopQuery);

            if (!existingUser || !existingShop) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The Shop");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            } else {
                if (req.body.name) {
                    existingShop.name = req.body.name;
                }
                if (req.body.userName) {
                    existingUser.userName = req.body.userName;
                }
                if (req.body.firstName) {
                    existingUser.firstName = req.body.firstName;
                }
                if (req.body.lastName) {
                    existingUser.lastName = req.body.lastName;
                }
                if (req.body.email) {
                    existingUser.email = req.body.email;
                    existingShop.email = req.body.email;
                }
                if (req.body.mobileCode) {
                    existingUser.mobileCode = req.body.mobileCode;
                    existingShop.mobileCode = req.body.mobileCode;
                }
                if (req.body.mobileNumber) {
                    existingUser.mobileNumber = req.body.mobileNumber;
                    existingShop.mobileNumber = req.body.mobileNumber;
                }
                if (req.body.pincode) {
                    existingUser.pincode = req.body.pincode;
                    existingShop.pincode = req.body.pincode;
                }
                if (req.body.location) {
                    existingUser.location = req.body.location;
                    existingShop.location = req.body.location;
                }
                if (req.body.countryCode) {
                    existingUser.countryCode = req.body.countryCode;
                    existingShop.countryCode = req.body.countryCode;
                }
                if (req.body.countryName) {
                    existingUser.countryName = req.body.countryName;
                    existingShop.countryName = req.body.countryName;
                }
                if (req.body.city) {
                    existingUser.city = req.body.city;
                    existingShop.city = req.body.city;
                }
                if (req.body.state) {
                    existingUser.state = req.body.state;
                    existingShop.state = req.body.state;
                }

                await existingUser.save();
                await existingShop.save();

                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE("The Shop"),
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

    //** Employees Creation */
    employeeCreate: async (req, res) => {
        try {
            req.assert("firstName", "First name is compulsory").notEmpty();
            req.assert("lastName", "Last name is compulsory").notEmpty();
            req.assert("mobileNumber", "Mobile number is compulsory").notEmpty();
            req.assert("mobileCode", "Mobile code is compulsory").notEmpty();
            req.assert("location", "Location is  compulsory").notEmpty();
            req.assert("countryName", "Country name is not compulsory").notEmpty();
            req.assert("countryCode", "Country code is not compulsory").notEmpty();
            req.assert("pincode", "Pincode is compulsory").notEmpty();
            req.assert("email", "Email is compulsory").notEmpty();
            req.assert("logo", "Logo is not compulsory").optional();
            req.assert("city", "City is not compulsory").notEmpty();
            req.assert("state", "State is not compulsory").notEmpty();
            req.assert("shopId", "Shop id is compulsory").notEmpty();
            req.assert("gender", "Gender is not compulsory").optional();
            req.assert("dob", "dob is not compulsory").optional();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    userName: {[Op.like]: req.body.userName},
                    mobileNumber: {[Op.like]: req.body.mobileNumber},
                },
            };

            let existingEmployee = await User.findOne(query);
            if (existingEmployee) {
                let errors = MESSAGES.apiSuccessStrings.DATA_ALREADY_EXISTS("The employee");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            }
            let newPassword = UserHelper.generateRandomPassword();
            let password = await bcrypt.hash(newPassword, bcrypt.genSaltSync(8));

            let user = await User.create({
                firstName: req.body.firstName,
                userName: await UserHelper.generateUniqueUsername(req.body.firstName),
                lastName: req.body.lastName,
                email: req.body.email,
                password: password,
                mobileCode: req.body.mobileCode,
                mobileNumber: req.body.mobileNumber,
                role: req.body.role,
                countryName: req.body.countryName,
                countryCode: req.body.countryCode,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                location: req.body.location,
                gender: req.body.gender,
                dob: req.body.dob,
            });
            let employee = await Employees.create({
                shopId: req.body.shopId,
            });

            await user.update({employeeId: employee.id});

            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The employee`),
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

    //** Employees change status  */
    employeeChangeStatus: async (req, res) => {
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

            let existingEmployee = await Employees.findOne(query);
            let userQuery = {
                where: {
                    employeeId: existingEmployee.id,
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                },
            };
            let existingUser = await User.findOne(userQuery);
            if (!existingEmployee) {
                const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The employee");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            existingEmployee.status =
                existingEmployee.status === OPTIONS.defaultStatus.ACTIVE
                    ? OPTIONS.defaultStatus.INACTIVE
                    : OPTIONS.defaultStatus.ACTIVE;
            await existingEmployee.save();

            existingUser.status = existingEmployee.status;
            await existingUser.save();

            res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.STATUS_CHANGE("The employee", existingEmployee.status),
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

    //** Employees listing  */
    employeeList: async (req, res) => {
        try {
            let order = [];

            if (order.length === 0) {
                order.push(["createdAt", "DESC"]);
            }
            let shopId = req.user.shopId;
            let start = req.query.start || 0;
            let limit = req.query.limit || 10;
            let whereQuery = {
                status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
            };
            if (req.query.search) {
                whereQuery[Op.or] = [
                    {firstName: req.query.search},
                    {lastName: req.query.search},
                    {mobileNumber: req.query.search},
                ];
            }
            let query = {
                where: whereQuery,
                include: [
                    {
                        where: {
                            shopId: shopId,
                        },
                        model: db.Employees,
                        as: "employees",
                    },
                ],
                attributes: [
                    "id",
                    "firstName",
                    "lastName",
                    "email",
                    "mobileCode",
                    "mobileNumber",
                    "status",
                    "countryCode",
                    "countryName",
                    "city",
                    "state",
                    "pincode",
                    "createdAt",
                    "lastLoginAt",
                ],
                order: order,
                offset: start,
                limit: limit,
            };
            let employeeList = await User.findAll(query);
            return res.json(generateResponse(resCode.HTTP_OK, employeeList));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** update Employees *//
    employeeUpdate: async (req, res) => {
        try {
            req.assert("firstName", "First name is compulsory").notEmpty();
            req.assert("lastName", "Last name is compulsory").notEmpty();
            req.assert("location", "Location is compulsory").notEmpty();
            req.assert("pincode", "pincode is compulsory").notEmpty();
            req.assert("mobileNumber", "mobile number is compulsory").notEmpty();
            req.assert("mobileCode", "Mobile code is compulsory").notEmpty();
            req.assert("email", "Email is compulsory").notEmpty();
            req.assert("city", "City is compulsory").notEmpty();
            req.assert("state", "State is compulsory").notEmpty();
            req.assert("countryName", "Country name is compulsory").notEmpty();
            req.assert("countryCode", "Country code is compulsory").notEmpty();
            req.assert("gender", "Gender is not compulsory").optional();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let queryEmployee = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    id: req.params.id,
                },
            };
            let queryUser = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    employeeId: req.params.id,
                },
            };
            let existingEmployee = await Employees.findOne(queryEmployee);
            let existingUser = await User.findOne(queryUser);

            if (!existingUser || !existingEmployee) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The employee");
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
                if (req.body.countryName) {
                    existingUser.countryName = req.body.countryName;
                }
                if (req.body.countryCode) {
                    existingUser.countryCode = req.body.countryCode;
                }
                if (req.body.pincode) {
                    existingUser.pincode = req.body.pincode;
                }
                if (req.body.location) {
                    existingUser.location = req.body.location;
                }
                if (req.body.mobileCode) {
                    existingUser.mobileCode = req.body.mobileCode;
                }
                if (req.body.mobileNumber) {
                    existingUser.mobileNumber = req.body.mobileNumber;
                }
                if (req.body.city) {
                    existingUser.city = req.body.city;
                }
                if (req.body.state) {
                    existingUser.state = req.body.state;
                }
                if (req.body.email) {
                    existingUser.email = req.body.email;
                }
                await existingUser.save();
                await existingEmployee.save();

                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE("The Employees"),
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

    //** view Employees */
    employeeView: async (req, res) => {
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
                attributes: ["id", "status", "createdAt", "updatedAt"],
            };
            let existingEmployee = await Employees.findOne(query);
            let queryUser = {
                where: {
                    employeeId: existingEmployee.id,
                },
                attributes: [
                    "id",
                    "employeeId",
                    "userName",
                    "firstName",
                    "lastName",
                    "email",
                    "mobileCode",
                    "mobileNumber",
                    "location",
                    "pincode",
                    "city",
                    "state",
                    "countryCode",
                    "countryName",
                    "createdAt",
                    "updatedAt",
                ],
            };
            let existingUser = await User.findOne(queryUser);

            let data = {
                employees: existingEmployee,
                user: existingUser,
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

    //** Employees delete  */
    employeeDelete: async (req, res) => {
        try {
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    id: req.params.id,
                },
            };
            let existingEmployee = await Employees.findOne(query);

            let userQuery = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    employeeId: existingEmployee.id,
                },
            };
            let existingUser = await User.findOne(userQuery);
            if (existingEmployee) {
                existingEmployee.status = OPTIONS.defaultStatus.DELETED;
                await existingEmployee.save();

            if (existingUser){
                existingUser.status = OPTIONS.defaultStatus.DELETED;
                existingUser.userName =
                    existingUser.userName + Date.now() + OPTIONS.defaultStatus.DELETED;
                await existingUser.save();
                }   
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.DELETED("The employee"),
                    })
                );
            } else {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("The employee");
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

module.exports = shopObj;
