const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const User = require("../../../../models").User;
const Employee = require("../../../../models").Employee;
const UserHelper = require("../../../../models/helpers/user.helpers");
const EmailRepository = require("../../../../shared/repositories/email.repository");
const SMSRepository = require("../../../../shared/repositories/sms.repository");

const {OPTIONS, generateURl, generateResponse, generateOTP} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const roles = OPTIONS.usersRoles;

const userObj = {
    //** create a new user */
    create: async (req, res) => {
        try {
            req.assert("firstName", "First Name cannot be blank").notEmpty();
            req.assert("lastName", "Last Name cannot be blank").notEmpty();
            req.assert("email", "Email cannot be blank").notEmpty();
            req.assert("mobileNumber", "Mobile number cannot be blank").notEmpty();
            req.assert("mobileCode", "Mobile code cannot be blank").notEmpty();
            req.assert("password", "Password must be greater then 6 characters").len(6);

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    [Op.or]: [{email: req.body.email.toLowerCase()}, {mobileNumber: req.body.mobileNumber}],
                },
            };
            /** check if user exist or not */
            let existingUser = await User.findOne(query);

            if (existingUser) {
                let errors = MESSAGES.apiErrorStrings.USER_EXISTS("email address");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            }

            let password = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(8));

            let token = generateOTP();
            let todayDate = new Date();
            todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
            /** create a new user */
            let user = User.create({
                userName: await UserHelper.generateUniqueUsername(req.body.firstName),
                email: req.body.email.toLowerCase(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: password,
                mobileCode: req.body.mobileCode,
                mobileNumber: req.body.mobileNumber,
                verificationToken: token,
                verificationTokenExpireAt: todayDate,
                role: OPTIONS.usersRoles.CUSTOMER,
                isEmailVerified: true,
            });

            /** send email to user*/
            // await EmailRepository.sendWelcomeEmail(user);
            // await EmailRepository.sendOTPEmail(user);
            // /** send sms to user*/
            // await SMSRepository.sendWelcomeMessage(user);
            // await SMSRepository.sendOTPMessage(user);

            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.OTP_SENT_SUCCESS,
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

    //** login user to app */
    login: async (req, res) => {
        try {
            req.assert("email", "Please enter email address").notEmpty();
            req.assert("password", "Please enter the user password").notEmpty();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    status: {
                        [Op.in]: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    },
                    [Op.or]: {email: req.body.email.toLowerCase()},
                    role: [
                        OPTIONS.usersRoles.CUSTOMER,
                        OPTIONS.usersRoles.EMPLOYEE,
                        OPTIONS.usersRoles.SHOP_KEEPER,
                        OPTIONS.usersRoles.SUPPLIER,
                    ],
                },
            };
            let existingUser = await User.findOne(query);
            if (existingUser) {
                let isMatch = existingUser.validPassword(req.body.password);
                if (isMatch) {
                    if (existingUser.status === OPTIONS.defaultStatus.INACTIVE) {
                        let errors = MESSAGES.apiErrorStrings.USER_BLOCKED;
                        return res
                            .status(resCode.HTTP_BAD_REQUEST)
                            .json(
                                generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.ACCOUNT_BLOCKED)
                            );
                    }
                    console.log(existingUser);
                    if (req.body.email && !existingUser.isEmailVerified) {
                        let todayDate = new Date();
                        todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
                        let token = generateOTP();
                        existingUser
                            .update({
                                verificationTokenExpireAt: todayDate,
                                verificationToken: token,
                            })
                            .then();
                        // await EmailRepository.sendOTPEmail(existingUser);
                        let errors = MESSAGES.apiErrorStrings.ACTIVATE_ACCOUNT;
                        return res
                            .status(resCode.HTTP_BAD_REQUEST)
                            .json(
                                generateResponse(
                                    resCode.HTTP_BAD_REQUEST,
                                    errors,
                                    MESSAGES.errorTypes.EMAIL_NOT_VERIFIED
                                )
                            );
                    }

                    existingUser.lastLoginAt = new Date();
                    await existingUser.save();

                    let userObj = {
                        id: existingUser.id,
                        token: existingUser.genToken(),
                        role: existingUser.role,
                        email: existingUser.email,
                        firstName: existingUser.firstName,
                        lastName: existingUser.lastName,
                    };

                    return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, userObj));
                } else {
                    let errors = MESSAGES.apiErrorStrings.INVALID_CREDENTIALS;
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
                }
            } else {
                let errors = MESSAGES.apiErrorStrings.INVALID_CREDENTIALS;
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

    //** get user profile */
    getProfile: async (req, res) => {
        try {
            let userId = req.user.id && req.query.id ? req.query.id : req.user.id;
            let query = {
                where: {
                    status: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.INACTIVE],
                    role: {
                        [Op.or]: [
                            OPTIONS.usersRoles.CUSTOMER,
                            OPTIONS.usersRoles.EMPLOYEE,
                            OPTIONS.usersRoles.SHOP_KEEPER,
                            OPTIONS.usersRoles.SUPPLIER,
                        ],
                    },
                    id: userId,
                },
                attributes: {
                    exclude: [
                        "password",
                        "passwordResetExpires",
                        "passwordResetToken",
                        "updatedAt",
                        "isEmailVerified",
                        "lastLoginAt",
                        "verificationToken",
                        "verificationTokenExpireAt",
                    ],
                },
            };
            let user = await User.findOne(query);
            if (user) {
                let existingUser = user.toJSON();
                existingUser["token"] = user.genToken();
                if (user.employeeId) {
                    let employeeQuery = {
                        where: {
                            id: user.employeeId,
                        },
                    };
                    let employee = await Employee.findOne(employeeQuery);
                    existingUser["employee"] = employee;
                }
                return res.json(generateResponse(resCode.HTTP_OK, existingUser));
            } else {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_UNAUTHORIZED)
                    .json(generateResponse(resCode.HTTP_UNAUTHORIZED, error, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** update the user profile */
    updateProfile: async (req, res) => {
        req.assert("userName", "Profile Name Cannot be blank").notEmpty();
        req.assert("firstName", "First Name cannot be blank").notEmpty();
        req.assert("lastName", "Last Name cannot be blank").notEmpty();
        req.assert("email", "Email Cannot be blank").notEmpty();
        req.assert("mobileNumber", "Phone Number Cannot be blank").notEmpty();
        req.assert("mobileCode", "Phone Code Cannot be blank").notEmpty();
        req.assert("dob", "Date of birth Number Cannot be blank").optional();
        req.assert("gender", "Gender Cannot be blank").optional();
        req.assert("bio", "Bio Cannot be blank").optional();
        req.assert("countryName", "country Cannot be blank").notEmpty();
        req.assert("city", "city Cannot be blank").optional();
        req.assert("state", "city Cannot be blank").notEmpty();
        req.assert("countryCode", "Country Cannot be blank").notEmpty();
        req.assert("location", "location Cannot be blank").optional();
        req.assert("websiteUrl", "Website Url Cannot be blank").optional();
        req.assert("profilePicture", "picture Url Cannot be blank").optional();
        req.assert("coverPicture", "cover picture Url Cannot be blank").optional();
        try {
            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    id: req.user.id,
                    status: OPTIONS.defaultStatus.ACTIVE,
                    role: OPTIONS.defaultStatus.USER,
                },
            };
            let user = await User.findOne(query);

            if (!user) {
                const errors = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.ENTITY_NOT_FOUND));
            }

            if (req.body.userName && user.userName !== req.body.userName) {
                let existingUserWithUsername = await UserHelper.findUserWithSameData({
                    userName: {[Op.iLike]: "%" + req.body.userName + "%"},
                });

                if (existingUserWithUsername) {
                    const errors = MESSAGES.apiErrorStrings.USERNAME_ALREADY_IN_USE;
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
                }

                user.userName = await UserHelper.generateUniqueUsername(req.body.userName);
            }

            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;

            let emailChange = false;

            if (req.body.email && user.email !== req.body.email) {
                let existingUserWithEmail = await UserHelper.findUserWithSameData({
                    email: req.body.email.toLowerCase(),
                });

                if (existingUserWithEmail) {
                    const errors = MESSAGES.apiErrorStrings.USER_EXISTS("email address");
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
                }

                emailChange = true;
                user.changeEmail = req.body.email.toLowerCase();
            }
            if (req.body.mobileNumber && parseInt(user.mobileNumber) !== parseInt(req.body.mobileNumber)) {
                let number = req.body.mobileNumber;
                let existingUserWithNumber = await UserHelper.findUserWithSameData({
                    mobileNumber: number,
                });

                if (existingUserWithNumber) {
                    const errors = MESSAGES.apiErrorStrings.USER_EXISTS("mobile number");
                    return res
                        .status(resCode.HTTP_BAD_REQUEST)
                        .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
                }

                user.mobileNumber = number || user.mobileNumber;
            }

            if (req.body.dob) {
                user.dob = req.body.dob;
            }
            if (req.body.gender && user.gender !== req.body.gender) {
                user.gender = req.body.gender;
            }

            user.countryCode = req.body.countryCode || user.countryCode;
            user.mobileCode = req.body.mobileCode || user.mobileCode;
            user.city = req.body.city || user.city;
            user.language = req.body.language;
            user.state = req.body.state || user.state;
            user.bio = req.body.bio;
            user.residence = req.body.location || user.location;
            user.websiteUrl = req.body.websiteUrl;
            user.countryName = req.body.countryName || user.countryName;

            if (req.body.profilePicture) {
                user.profilePicture = req.body.profilePicture;
            }
            if (req.body.coverPicture) {
                user.coverPicture = req.body.coverPicture;
            }

            let token = generateOTP();
            if (emailChange) {
                let todayDate = new Date();
                todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
                user.verificationToken = token;
                user.verificationTokenExpireAt = todayDate;
            }
            await user.save();

            if (emailChange) {
                await EmailRepository.sendOTPEmail(user);
            }

            return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, user));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** verify email */
    emailVerify: async (req, res) => {
        try {
            if (!req.params.token) {
                let error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let query = {
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    verificationTokenExpireAt: req.params.token,
                    role: OPTIONS.usersRoles.USER,
                },
            };

            let existingUser = await User.findOne(query);

            if (!existingUser) {
                const message = MESSAGES.apiErrorStrings.INVALID_TOKEN;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, message, MESSAGES.errorTypes.INPUT_VALIDATION));
            } else {
                let emailChange = false;
                if (existingUser.isEmailVerified && existingUser.changeEmail) {
                    existingUser.email = existingUser.changeEmail;
                    existingUser.changeEmail = null;
                    emailChange = true;
                }

                existingUser.isEmailVerified = true;
                existingUser.verificationTokenExpireAt = null;

                await existingUser.save();

                let message = MESSAGES.apiSuccessStrings.EMAIL_UPDATE;
                if (!emailChange) {
                    message = MESSAGES.apiSuccessStrings.UPDATE("User profile");
                    await EmailRepository.sendWelcomeEmail(existingUser);
                }

                return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, {message}));
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** facebook login */
    fbLogin: async function (req, res) {
        try {
            req.assert("fbAccessToken", "fbAccessToken can not be blank!").notEmpty();
            req.assert("fbProfileId", "fbProfileId can not be blank").notEmpty();
            req.assert("name", "name can not be blank").notEmpty();
            req.assert("picture", "picture can not be blank").optional();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let accessToken = req.body.fbAccessToken;
            let profileId = req.body.fbProfileId;

            // Validate
            let clientSecret = process.env.FB_CLIENT_SECRET;
            let clientId = process.env.FB_CLIENT_ID;
            let appLink =
                "https://graph.facebook.com/oauth/access_token?client_id=" +
                clientId +
                "&client_secret=" +
                clientSecret +
                "&grant_type=client_credentials";
            let response = await fetch(appLink);
            if (!response) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            let appToken = await response.json();
            if (!appToken || !appToken["access_token"]) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            appToken = appToken["access_token"];
            let link =
                "https://graph.facebook.com/debug_token?input_token=" + accessToken + "&access_token=" + appToken;
            let profileResponse = await fetch(link);
            if (!profileResponse) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            profileResponse = await profileResponse.json();

            if (!profileResponse || !profileResponse["data"]) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }
            let profile = profileResponse["data"];
            let user_id = profile["user_id"];

            if (!user_id || user_id !== profileId) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            // Valid access token

            let query = {
                where: {
                    status: {
                        [Op.in]: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.BLOCKED],
                    },
                    facebook: profileId,
                    role: OPTIONS.usersRoles.USER,
                },
                attributes: {
                    exclude: [
                        "password",
                        "passwordResetExpires",
                        "passwordResetToken",
                        "updatedAt",
                        "isEmailVerified",
                        "lastLoginAt",
                    ],
                },
            };

            let existingUser = await User.findOne(query);

            if (existingUser) {
                if (
                    existingUser.status === OPTIONS.defaultStatus.INACTIVE ||
                    existingUser.status === OPTIONS.defaultStatus.BLOCKED
                ) {
                    let error = MESSAGES.apiErrorStrings.USER_BLOCKED;
                    return res
                        .status(resCode.HTTP_UNAUTHORIZED)
                        .json(generateResponse(resCode.HTTP_UNAUTHORIZED, error, MESSAGES.errorTypes.ACCOUNT_BLOCKED));
                }

                let userObj = existingUser.toJSON();
                userObj["token"] = existingUser.genToken();
                await UserHelper.updateLastLogin(existingUser.id);
                return res.json(generateResponse(resCode.HTTP_OK, userObj));
            } else {
                let user = await User.create({
                    name: req.body.name,
                    email: req.body.email || null,
                    userName: await UserHelper.generateUniqueUsername(req.body.name),
                    facebook: req.body.fbProfileId,
                    role: OPTIONS.usersRoles.USER,
                    password: "FB" + Date.now(),
                    lastLoginAt: new Date(),
                    socialProfilePicture: req.body.photoUrl,
                });
                let userObj = user.toJSON();
                userObj["token"] = user.genToken();
                userObj["isNew"] = true;

                return res.json(generateResponse(resCode.HTTP_OK, userObj));
            }
        } catch (err) {
            customErrorLogger(err);
            let error = MESSAGES.apiErrorStrings.SERVER_ERROR;
            return res
                .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
                .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, error));
        }
    },

    //** google login */
    googleLogin: async function (req, res) {
        try {
            req.assert("gAccessToken", "gAccessToken can not be blank!").notEmpty();
            req.assert("gProfileId", "gProfileId can not be blank").notEmpty();
            req.assert("name", "name can not be blank").notEmpty();
            req.assert("picture", "picture can not be blank").optional();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let accessToken = req.body.gAccessToken;
            let profileId = req.body.gProfileId;

            let appLink = `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`;
            let response = await fetch(appLink);
            if (!response) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            let userData = await response.json();
            if (!userData || userData["sub"] !== profileId) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(
                        generateResponse(
                            resCode.HTTP_BAD_REQUEST,
                            "Invalid request",
                            MESSAGES.errorTypes.OAUTH_EXCEPTION
                        )
                    );
            }

            // Valid access token
            let query = {
                where: {
                    status: {
                        [Op.in]: [OPTIONS.defaultStatus.ACTIVE, OPTIONS.defaultStatus.BLOCKED],
                    },
                    google: profileId,
                    role: OPTIONS.usersRoles.USER,
                },
                attributes: {
                    exclude: [
                        "password",
                        "passwordResetExpires",
                        "passwordResetToken",
                        "updatedAt",
                        "isEmailVerified",
                        "lastLoginAt",
                    ],
                },
            };

            let existingUser = await User.findOne(query);

            if (existingUser) {
                if (
                    existingUser.status === OPTIONS.defaultStatus.INACTIVE ||
                    existingUser.status === OPTIONS.defaultStatus.BLOCKED
                ) {
                    let error = MESSAGES.apiErrorStrings.USER_BLOCKED;
                    return res
                        .status(resCode.HTTP_UNAUTHORIZED)
                        .json(generateResponse(resCode.HTTP_UNAUTHORIZED, error, MESSAGES.errorTypes.ACCOUNT_BLOCKED));
                }

                let userObj = existingUser.toJSON();
                userObj["token"] = existingUser.genToken();
                await UserHelper.updateLastLogin(existingUser.id);

                return res.json(generateResponse(resCode.HTTP_OK, userObj));
            } else {
                let user = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    socialProfilePicture: req.body.photoUrl,
                    username: await UserHelper.generateUniqueUsername(req.body.name),
                    google: req.body.gProfileId,
                    role: OPTIONS.usersRoles.USER,
                    password: "GOOGLE" + Date.now(),
                    lastLoginAt: new Date(),
                });
                let userObj = user.toJSON();
                userObj["token"] = user.genToken();
                userObj["isNew"] = true;

                await EmailRepository.sendWelcomeEmail(user);

                return res.json(generateResponse(resCode.HTTP_OK, userObj));
            }
        } catch (err) {
            customErrorLogger(err);
            let error = MESSAGES.apiErrorStrings.SERVER_ERROR;
            return res
                .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
                .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, error));
        }
    },

    //** send token for  */
    sendToken: async (req, res) => {
        try {
            req.assert("email", "Email cannot be blank").notEmpty();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let query = {
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    email: req.body.email,
                },
            };

            let existingUser = await User.findOne(query);

            if (!existingUser) {
                const message = MESSAGES.apiErrorStrings.USER_EXISTS("email address");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, message, MESSAGES.errorTypes.INPUT_VALIDATION));
            } else {
                let today = new Date();
                today.setDate(today.getDate() + OPTIONS.otpExpireInDays);
                existingUser.verificationToken = generateOTP(5);
                existingUser.verificationTokenExpireAt = today;
                await existingUser.save();

                /** send email to user*/
                // await EmailRepository.sendOTPEmail(user);
                /** send sms to user*/
                // await SMSRepository.sendOTPMessage(user);

                return res.status(resCode.HTTP_OK).json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.OTP_SENT_SUCCESS,
                    })
                );
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
        }
    },

    //** verify the token */
    verifyToken: async (req, res) => {
        try {
            req.assert("otp", "Please enter a valid otp.").notEmpty();
            req.assert("email", "Email cannot be blank").notEmpty();

            let errors = req.validationErrors();
            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            let query = {
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    role: [roles.CUSTOMER, roles.SHOP_KEEPER, roles.SUPPLIER, roles.EMPLOYEE],
                    verificationToken: req.body.otp,
                    email: req.body.email,
                    verificationTokenExpireAt: {[Op.gte]: new Date()},
                },
            };

            let existingUser = await User.findOne(query);
            if (!existingUser) {
                let error = MESSAGES.apiErrorStrings.OTP_EXPIRED;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, MESSAGES.errorTypes.INPUT_VALIDATION));
            }
            existingUser.isEmailVerified = true;
            existingUser.verificationToken = null;
            existingUser.verificationTokenExpireAt = null;

            await existingUser.save();
            const message = MESSAGES.apiSuccessStrings.OTP_VERIFIED;

            return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, {message}));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },

    //** reset the password */
    resetPassword: async (req, res) => {
        try {
            req.assert("otp", "Please enter a valid otp.").notEmpty();
            req.assert("password", "Password must be at least 6 characters long").len(6);
            req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);

            const errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, OPTIONS.errorTypes.INPUT_VALIDATION));
            }

            let query = {
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    role: [roles.SUPPLIER, roles.SYSTEM_USER, roles.SYSTEM_MANAGER, roles.SYSTEM_OWNER],
                    verificationOtp: req.body.otp,
                    verificationOtpExpireAt: {[Op.gte]: new Date()},
                },
            };

            let user = await User.findOne(query);
            if (!user) {
                let error = MESSAGES.apiErrorStrings.OTP_EXPIRED;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error, OPTIONS.errorTypes.ENTITY_NOT_FOUND));
            } else {
                user.password = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(8));
                user.verificationOtp = null;
                user.verificationOtpExpireAt = null;

                await user.save();

                /** send email to user*/
                await EmailRepository.sendResetPassword(user);
                /** send sms to user*/
                // await SMSRepository.sendOTPMessage(user);

                const message = MESSAGES.apiSuccessStrings.PASSWORD_RESET;
                return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, {message}));
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
module.exports = userObj;
