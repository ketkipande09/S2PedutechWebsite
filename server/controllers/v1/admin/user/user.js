const fs = require('fs');
const sequelize = require('sequelize');
const mail = require('../../../../config/middlewares/triggerMail');
const bcrypt = require('bcrypt');
const User = require('../../../../models').User;
const db = require('../../../../models');
const UserHelper = require('../../../../models/helpers/user.helpers');
const EmailRepository = require('../../../../shared/repositories/email.repository');
const SMSRepository = require('../../../../shared/repositories/sms.repository');
const customErrorLogger = require('../../../../shared/service/customExceptionHandler');
const {
  OPTIONS,
  generateURl,
  generateResponse,
  generateOTP,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;
const roles = OPTIONS.usersRoles;

const userObj = {
  //** get all the user */
  listing: async (req, res) => {
    try {
      let offset = parseInt(req.body.start) || 0;
      let limit = parseInt(req.body.length) || 10;
      let order = req.body.order;
      let columns = req.body.columns;
      let search = req.body.search;
      let status = req.body.status;
      let userRoles = req.body.roles;
      let orderBySuffix = '';
      if (draw > 1 && order && order.length > 0) {
        for (let i = 0; i < order.length; i++) {
          let o = order[i];
          let orderByColumnIndex = o.column;
          let orderByColumnDirection = o.dir;
          let orderByColumnName = columns[orderByColumnIndex].data;
          if (orderByColumnName === '' || !orderByColumnName) {
            orderBySuffix = 'u.createdAt DESC';
          } else if (orderByColumnName === 'countryName') {
            orderBySuffix = 'u.countryName ' + orderByColumnDirection;
          } else {
            orderBySuffix =
              'u.' + orderByColumnName + ' ' + orderByColumnDirection;
          }
        }
      } else {
        orderBySuffix = 'u.createdAt DESC';
      }
      let roles = [
        OPTIONS.usersRoles.ADMIN,
        OPTIONS.usersRoles.SHOP_KEEPER,
        OPTIONS.usersRoles.SUPPLIER,
        OPTIONS.usersRoles.CUSTOMER,
        OPTIONS.usersRoles.EMPLOYEE,
      ];
      if (userRoles && userRoles.length > 0) {
        roles = userRoles;
      }
      roles = roles.join("','");
      roles = `'${roles}'`;
      // Search
      let whereQuery = `(u.role IN (${roles}) AND u.status = '${OPTIONS.defaultStatus.ACTIVE}' OR u.status = '${OPTIONS.defaultStatus.INACTIVE}')`;

      if (status && status.length > 0 && status !== 'all') {
        status = status.join("','");
        status = `'${status}'`;
        whereQuery = `(u.status IN (${status}) )`;
      }
      if (search && search.value && search.value.length > 0) {
        whereQuery += ` AND (u.firstName LIKE '%${search.value}%' OR u.lastName LIKE '%${search.value}%' OR u.email LIKE '%${search.value}%' OR u.mobileNumber LIKE '%${search.value}%')`;
      }

      let coreQuery = `SELECT u.mobileCode,u.mobileNumber,u.role,u.id,u.userName, u.firstName,u.lastName, u.profilePicture, u.status, u.email, u.google, u.facebook, u.createdAt , u.lastLoginAt, u.countryCode, u.countryName,u.location FROM User u WHERE ${whereQuery}`;
      let countQuery = `SELECT COUNT(*) AS count FROM User u WHERE ${whereQuery}`;

      const queryCoreOrder = `${coreQuery} ORDER BY ${orderBySuffix}`;
      const query = `${queryCoreOrder} LIMIT ${limit} OFFSET ${offset}`;

      const rows = await db.sequelize.query(query, {
        type: db.sequelize.QueryTypes.SELECT,
      });

      const countRows = await db.sequelize.query(countQuery, {
        type: db.sequelize.QueryTypes.SELECT,
      });
      let outputData = {
        draw: draw,
        recordsTotal:
          countRows && countRows.length > 0
            ? parseInt(countRows[0].count)
            : rows.length,
        recordsFiltered:
          countRows && countRows.length > 0
            ? parseInt(countRows[0].count)
            : rows.length,
      };

      let data = [];
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          let rowData = rows[i];
          if (!rowData) continue;
          let row = {
            DT_RowId: rowData.id,
            DT_RowClass: 'user_' + rowData.id,
            id: rowData.id,
            role: rowData.role,
            userName: rowData.userName,
            firstName: rowData.firstName,
            lastName: rowData.lastName,
            status: rowData.status,
            email: rowData.email,
            mobileCode: rowData.mobileCode,
            mobileNumber: rowData.mobileNumber,
            countryName: rowData.countryName,
            countryCode: rowData.countryCode,
            location: rowData.location,
            google: rowData.google,
            facebook: rowData.facebook,
            profilePicture: rowData.profilePicture,
            createdAt: rowData.createdAt,
            lastLoginAt: rowData.lastLoginAt,
          };
          data.push(row);
        }
      }
      outputData.data = data;
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, outputData));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** Get all users */
  getAllUsers: async (req, res) => {
    try {
      let offset = req.query.page || 1;
      offset = offset - 1;
      offset = offset * req.query.pageSize || 0;
      let limit = req.query.pageSize || 10;
      let query = { status: OPTIONS.defaultStatus.ACTIVE };
      if (req.query.search) {
        query = {
          [Op.and]: [
            { status: OPTIONS.defaultStatus.ACTIVE },
            {
              [Op.or]: [
                { userName: { [Op.substring]: req.query.search } },
                { email: { [Op.substring]: req.query.search } },
                { mobileNumber: { [Op.substring]: req.query.search } },
                { role: { [Op.substring]: req.query.search } },
              ],
            },
          ],
        };
      }
      let { count, rows } = await User.findAndCountAll({
        where: query,
        attributes: {
          exclude: ['passwordResetToken', 'passwordResetExpires', 'password'],
        },
        offset: parseInt(offset),
        limit: parseInt(limit),
      });
      let payload = {
        user: rows,
        count: count,
      };
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, payload));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
    }
  },

  //** crate a new user */
  create: async (req, res) => {
    try {
      let query = {
        where: {
          [Op.or]: [{ email: req.body.email.toLowerCase() }],
        },
      };

      /** check if user exist or not */
      let existingUser = await User.findOne(query);

      if (existingUser) {
        let errors = MESSAGES.apiErrorStrings.USER_EXISTS(
          'email address or mobile number'
        );
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
      // let newPassword = UserHelper.generateRandomPassword();
      let password = await bcrypt.hash(
        req.body.password,
        bcrypt.genSaltSync(8)
      );

      // let token = generateOTP();
      let todayDate = new Date();
      todayDate.setDate(todayDate.getDate() + OPTIONS.otpExpireInDays);
      /** create a new user */
      let user = User.create({
        // userName: await UserHelper.generateUniqueUsername(req.body.firstName + req.body.lastName),
        userName: req.body.userName,
        email: req.body.email.toLowerCase(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: password,
        mobileCode: req.body.mobileCode,
        mobileNumber: req.body.mobileNumber,
        countryCode: req.body.countryCode,
        countryName: req.body.countryName,
        city: req.body.city,
        state: req.body.state,
        role: req.body.role,
        pincode: req.body.pincode,
        location: req.body.location,
        isEmailVerified: true,
      });
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.SIGNUP_SUCCESS,
        })
      );
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** login user to app */
  login: async (req, res) => {
    try {
      let existingUser = await User.findOne({
        where: {
          status: {
            [Op.in]: [
              OPTIONS.defaultStatus.ACTIVE,
              OPTIONS.defaultStatus.INACTIVE,
            ],
          },
          [Op.or]: [{ email: req.body.email.toLowerCase() }],
          role: [OPTIONS.usersRoles.ADMIN, OPTIONS.usersRoles.SUPER_ADMIN],
        },
      });
      console.log("existingUser", existingUser);
      if (existingUser) {
        let isMatch = existingUser.validPassword(req.body.password);
        if (isMatch) {
          if (
            existingUser.status === OPTIONS.defaultStatus.BLOCKED ||
            existingUser.status === OPTIONS.defaultStatus.INACTIVE
          ) {
            let errors = MESSAGES.apiErrorStrings.USER_BLOCKED;
            return res
              .status(resCode.HTTP_BAD_REQUEST)
              .json(
                generateResponse(
                  resCode.HTTP_BAD_REQUEST,
                  errors,
                  MESSAGES.errorTypes.ACCOUNT_BLOCKED
                )
              );
          }
          if (req.body.email && !existingUser.isEmailVerified) {
            let todayDate = new Date();
            todayDate.setDate(
              todayDate.getDate() + OPTIONS.emailVerificationExpireInDays
            );
            let token = generateOTP();
            existingUser
              .update({
                verificationTokenExpireAt: todayDate,
                verificationToken: token,
              })
              .then();
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

          return res
            .status(resCode.HTTP_OK)
            .json(generateResponse(resCode.HTTP_OK, userObj));
        } else {
          let errors = MESSAGES.apiErrorStrings.INVALID_CREDENTIALS;
          return res
            .status(resCode.HTTP_BAD_REQUEST)
            .json(
              generateResponse(
                resCode.HTTP_BAD_REQUEST,
                errors,
                MESSAGES.errorTypes.OAUTH_EXCEPTION
              )
            );
        }
      } else {
        let errors = MESSAGES.apiErrorStrings.INVALID_CREDENTIALS;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** get user profile */
  getProfile: async (req, res) => {
    try {
      let userId = req.query.id ? req.query.id : req.user.id;
      let query = {
        where: {
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
          role: {
            [Op.or]: OPTIONS.usersRoles.getAllRolesAsArray(),
          },
          id: userId,
        },
        attributes: {
          exclude: [
            'password',
            'passwordResetExpires',
            'passwordResetToken',
            'updatedAt',
            'isEmailVerified',
            'lastLoginAt',
            'verificationToken',
            'verificationTokenExpireAt',
          ],
        },
      };
      let user = await User.findOne(query);
      if (user) {
        let existingUser = user.toJSON();
        existingUser['token'] = user.genToken();
        return res.json(generateResponse(resCode.HTTP_OK, existingUser));
      } else {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_UNAUTHORIZED)
          .json(
            generateResponse(
              resCode.HTTP_UNAUTHORIZED,
              error,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** update the user profile */
  updateProfile: async (req, res) => {
    try {
      let query = {
        where: {
          id: req.query.id ? req.query.id : req.user.id,
          role: roles.getAllRolesAsArray(),
        },
      };
      let user = await User.findOne(query);

      if (!user) {
        const errors = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.ENTITY_NOT_FOUND
            )
          );
      }
      if (req.body.userName && user.userName !== req.body.userName) {
        let existingUserWithUserName = await UserHelper.findUserWithSameData({
          userName: { [Op.like]: '%' + req.body.userName + '%' },
        });

        if (existingUserWithUserName) {
          const errors = MESSAGES.apiErrorStrings.USERNAME_ALREADY_IN_USE;
          return res
            .status(resCode.HTTP_BAD_REQUEST)
            .json(
              generateResponse(
                resCode.HTTP_BAD_REQUEST,
                errors,
                MESSAGES.errorTypes.INPUT_VALIDATION
              )
            );
        }
        user.userName = await UserHelper.generateUniqueUsername(
          req.body.userName
        );
      }

      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;

      let emailChange = false;

      if (req.body.email && user.email !== req.body.email) {
        let existingUserWithEmail = await UserHelper.findUserWithSameData({
          email: req.body.email.toLowerCase(),
        });

        if (existingUserWithEmail) {
          const errors = MESSAGES.apiErrorStrings.USER_EXISTS('email address');
          return res
            .status(resCode.HTTP_BAD_REQUEST)
            .json(
              generateResponse(
                resCode.HTTP_BAD_REQUEST,
                errors,
                MESSAGES.errorTypes.INPUT_VALIDATION
              )
            );
        }
        emailChange = true;
        user.email = req.body.email.toLowerCase();
        user.changeEmail = req.body.email.toLowerCase();
      }
      if (
        req.body.mobileNumber &&
        parseInt(user.mobileNumber) !== parseInt(req.body.mobileNumber)
      ) {
        let number = req.body.mobileNumber;
        let existingUserWithNumber = await UserHelper.findUserWithSameData({
          mobile: number,
        });

        if (existingUserWithNumber) {
          const errors = MESSAGES.apiErrorStrings.USER_EXISTS('mobile number');
          return res
            .status(resCode.HTTP_BAD_REQUEST)
            .json(
              generateResponse(
                resCode.HTTP_BAD_REQUEST,
                errors,
                MESSAGES.errorTypes.INPUT_VALIDATION
              )
            );
        }

        user.mobile = number || user.mobile;
      }
      user.countryCode = req.body.countryCode || user.countryCode;
      user.mobileCode = req.body.mobileCode || user.mobileCode;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.bio = req.body.bio;
      user.location = req.body.location || user.location;
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
      return res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.UPDATE('User profile has been'),
        })
      );
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** update the account status */
  updateAccountStatus: async (req, res) => {
    let id = req.params.id;

    if (!id) {
      const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
      return res
        .status(resCode.HTTP_UNAUTHORIZED)
        .json(
          generateResponse(
            resCode.HTTP_UNAUTHORIZED,
            error,
            MESSAGES.errorTypes.INPUT_VALIDATION
          )
        );
    }
    try {
      let query = {
        where: {
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
          id: req.params.id,
        },
      };

      let user = await User.findOne(query);

      if (!user) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_UNAUTHORIZED)
          .json(
            generateResponse(
              resCode.HTTP_UNAUTHORIZED,
              error,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }

      user.status =
        user.status === OPTIONS.defaultStatus.ACTIVE
          ? OPTIONS.defaultStatus.INACTIVE
          : OPTIONS.defaultStatus.ACTIVE;

      await user.save();
      const message = MESSAGES.apiSuccessStrings.UPDATE('User account status');
      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, message));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
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
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              error,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
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
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              message,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
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
          message = MESSAGES.apiSuccessStrings.UPDATE('User profile');
          await EmailRepository.sendWelcomeEmail(existingUser);
        }

        return res
          .status(resCode.HTTP_OK)
          .json(generateResponse(resCode.HTTP_OK, { message }));
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** facebook login */
  fbLogin: async (req, res) => {
    try {
      req.assert('fbAccessToken', 'fbAccessToken can not be blank!').notEmpty();
      req.assert('fbProfileId', 'fbProfileId can not be blank').notEmpty();
      req.assert('name', 'name can not be blank').notEmpty();
      req.assert('picture', 'picture can not be blank').optional();

      let errors = req.validationErrors();

      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }

      let accessToken = req.body.fbAccessToken;
      let profileId = req.body.fbProfileId;

      // Validate
      let clientSecret = process.env.FB_CLIENT_SECRET;
      let clientId = process.env.FB_CLIENT_ID;
      let appLink =
        'https://graph.facebook.com/oauth/access_token?client_id=' +
        clientId +
        '&client_secret=' +
        clientSecret +
        '&grant_type=client_credentials';
      let response = await fetch(appLink);
      if (!response) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      let appToken = await response.json();
      if (!appToken || !appToken['access_token']) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      appToken = appToken['access_token'];
      let link =
        'https://graph.facebook.com/debug_token?input_token=' +
        accessToken +
        '&access_token=' +
        appToken;
      let profileResponse = await fetch(link);
      if (!profileResponse) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      profileResponse = await profileResponse.json();

      if (!profileResponse || !profileResponse['data']) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
      let profile = profileResponse['data'];
      let user_id = profile['user_id'];

      if (!user_id || user_id !== profileId) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      // Valid access token

      let query = {
        where: {
          status: {
            [Op.in]: [
              OPTIONS.defaultStatus.ACTIVE,
              OPTIONS.defaultStatus.BLOCKED,
            ],
          },
          facebook: profileId,
          role: OPTIONS.usersRoles.USER,
        },
        attributes: {
          exclude: [
            'password',
            'passwordResetExpires',
            'passwordResetToken',
            'updatedAt',
            'isEmailVerified',
            'lastLoginAt',
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
            .json(
              generateResponse(
                resCode.HTTP_UNAUTHORIZED,
                error,
                MESSAGES.errorTypes.ACCOUNT_BLOCKED
              )
            );
        }

        let userObj = existingUser.toJSON();
        userObj['token'] = existingUser.genToken();
        await UserHelper.updateLastLogin(existingUser.id);
        return res.json(generateResponse(resCode.HTTP_OK, userObj));
      } else {
        let user = await User.create({
          name: req.body.name,
          email: req.body.email || null,
          userName: await UserHelper.generateUniqueuserName(req.body.name),
          facebook: req.body.fbProfileId,
          role: OPTIONS.usersRoles.USER,
          password: 'FB' + Date.now(),
          lastLoginAt: new Date(),
          socialProfilePicture: req.body.photoUrl,
        });
        let userObj = user.toJSON();
        userObj['token'] = user.genToken();
        userObj['isNew'] = true;

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
  googleLogin: async (req, res) => {
    try {
      req.assert('gAccessToken', 'gAccessToken can not be blank!').notEmpty();
      req.assert('gProfileId', 'gProfileId can not be blank').notEmpty();
      req.assert('name', 'name can not be blank').notEmpty();
      req.assert('picture', 'picture can not be blank').optional();

      let errors = req.validationErrors();

      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
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
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
      let userData = await response.json();
      if (!userData || userData['sub'] !== profileId) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              'Invalid request',
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      // Valid access token
      let query = {
        where: {
          status: {
            [Op.in]: [
              OPTIONS.defaultStatus.ACTIVE,
              OPTIONS.defaultStatus.BLOCKED,
            ],
          },
          google: profileId,
          role: OPTIONS.usersRoles.USER,
        },
        attributes: {
          exclude: [
            'password',
            'passwordResetExpires',
            'passwordResetToken',
            'updatedAt',
            'isEmailVerified',
            'lastLoginAt',
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
            .json(
              generateResponse(
                resCode.HTTP_UNAUTHORIZED,
                error,
                MESSAGES.errorTypes.ACCOUNT_BLOCKED
              )
            );
        }

        let userObj = existingUser.toJSON();
        userObj['token'] = existingUser.genToken();
        await UserHelper.updateLastLogin(existingUser.id);

        return res.json(generateResponse(resCode.HTTP_OK, userObj));
      } else {
        let user = await User.create({
          name: req.body.name,
          email: req.body.email,
          socialProfilePicture: req.body.photoUrl,
          userName: await UserHelper.generateUniqueuserName(req.body.name),
          google: req.body.gProfileId,
          role: OPTIONS.usersRoles.USER,
          password: 'GOOGLE' + Date.now(),
          lastLoginAt: new Date(),
        });
        let userObj = user.toJSON();
        userObj['token'] = user.genToken();
        userObj['isNew'] = true;

        // await EmailRepository.sendWelcomeEmail(user);

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
      req.assert('email', 'Email cannot be blank').notEmpty();

      let errors = req.validationErrors();

      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }

      let query = {
        where: {
          status: OPTIONS.defaultStatus.ACTIVE,
          email: req.body.email,
        },
      };

      let existingUser = await User.findOne(query);

      if (!existingUser) {
        const message = MESSAGES.apiErrorStrings.USER_EXISTS('email address');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              message,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      } else {
        let today = new Date();
        today.setDate(today.getDate() + OPTIONS.otpExpireInDays);
        existingUser.verificationToken = generateOTP(5);
        existingUser.verificationTokenExpireAt = today;
        let token = existingUser.genToken();
        await existingUser.save();

        /** send email to user*/
        // await EmailRepository.sendOTPEmail(user);
        /** send sms to user*/
        // await SMSRepository.sendOTPMessage(user);

        return res.status(resCode.HTTP_OK).json(
          generateResponse(resCode.HTTP_OK, {
            token: token,
          })
        );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
    }
  },

  //** verify the token */
  verifyToken: async (req, res) => {
    try {
      req.assert('otp', 'Please enter a valid otp.').notEmpty();
      req.assert('email', 'Email cannot be blank').notEmpty();

      let errors = req.validationErrors();
      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
      let query = {
        where: {
          status: OPTIONS.defaultStatus.ACTIVE,
          role: [roles.SUPER_ADMIN, roles.ADMIN],
          verificationToken: req.body.otp,
          email: req.body.email,
          verificationTokenExpireAt: { [Op.gte]: new Date() },
        },
      };

      let existingUser = await User.findOne(query);
      if (!existingUser) {
        let error = MESSAGES.apiErrorStrings.OTP_EXPIRED;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              error,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
      existingUser.isEmailVerified = true;
      existingUser.verificationToken = null;
      existingUser.verificationTokenExpireAt = null;

      await existingUser.save();
      const message = MESSAGES.apiSuccessStrings.OTP_VERIFIED;

      return res
        .status(resCode.HTTP_OK)
        .json(generateResponse(resCode.HTTP_OK, { message }));
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //** reset the password */
  resetPassword: async (req, res) => {
    try {
      let query = {
        where: {
          // status: OPTIONS.defaultStatus.ACTIVE,
          // role: roles.getAllRolesAsArray(),
          id: req.body.id,
          // verificationOtp: req.body.otp,
          // verificationTokenExpireAt: { [Op.gte]: new Date() },
        },
      };

      let user = await User.findOne(query);
      if (!user) {
        let error = MESSAGES.apiErrorStrings.OTP_EXPIRED;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              error,
              MESSAGES.errorTypes.ENTITY_NOT_FOUND
            )
          );
      } else {
        // let isMatch = user.validPassword(req.body.oldPassword);
        let isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

        if (isMatch) {
          if (
            user.status === OPTIONS.defaultStatus.BLOCKED ||
            user.status === OPTIONS.defaultStatus.INACTIVE
          ) {
            let errors = MESSAGES.apiErrorStrings.USER_BLOCKED;
            return res
              .status(resCode.HTTP_BAD_REQUEST)
              .json(
                generateResponse(
                  resCode.HTTP_BAD_REQUEST,
                  errors,
                  MESSAGES.errorTypes.ACCOUNT_BLOCKED
                )
              );
          }

          user.password = await bcrypt.hash(
            req.body.newPassword,
            bcrypt.genSaltSync(8)
          );
          user.verificationToken = null;
          user.verificationTokenExpireAt = null;
          await user.save();
          const message = MESSAGES.apiSuccessStrings.PASSWORD_RESET;
          return res
            .status(resCode.HTTP_OK)
            .json(generateResponse(resCode.HTTP_OK, { message }));
        } else {
          let errors = MESSAGES.apiErrorStrings.INVALID_CREDENTIALS;
          return res
            .status(resCode.HTTP_BAD_REQUEST)
            .json(
              generateResponse(
                resCode.HTTP_BAD_REQUEST,
                errors,
                MESSAGES.errorTypes.OAUTH_EXCEPTION
              )
            );
        }
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  forgetPassword: async (req, res) => {
    try {
      if (!req.body.email) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }
      let query = {
        where: { email: req.body.email.toLowerCase() },
      };
      let existingUser = await User.findOne(query);
      if (!existingUser) {
        let errors = MESSAGES.apiErrorStrings.USER_DOES_NOT_EXIST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      } else {
        existingUser.resetPin = Math.floor(Math.random() * 899999 + 100000);
        let user = await existingUser.save();
        let data = {
          name: `${user.userName}`,
          email: user.email,
          url: `${process.env.REQ_URL}/auth/set-pwd?sub=${user.id}&pin=${user.resetPin}`,
        };
        mail.sendForgetMail(req, data);

        return res.status(resCode.HTTP_OK).json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.EMAIL_FORGOT,
          })
        );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** set the password */
  setPassword: async (req, res) => {
    try {
      let query = {
        where: { id: req.body.id },
      };
      let user = await User.findOne(query);
      if (!user) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      } else {
        if (user.resetPin == req.body.resetPin) {
          user.password = await bcrypt.hash(
            req.body.password,
            bcrypt.genSaltSync(8)
          );
          user.resetPin = null;
          let users = await user.save();
          return res.status(resCode.HTTP_OK).json(
            generateResponse(resCode.HTTP_OK, {
              message: MESSAGES.apiSuccessStrings.PASSWORD('set'),
            })
          );
        } else {
          let errors = MESSAGES.apiErrorStrings.INVALID_TOKEN;
          res
            .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
            .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR));
        }
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
  //** change the status of user */
  changeStatus: async (req, res) => {
    try {
      let id = req.query.id;
      if (!id) {
        const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
      }

      let query = {
        where: {
          id: id,
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
        },
      };

      let existingUser = await User.findOne(query);
      if (!existingUser) {
        const error = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('User');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              error,
              MESSAGES.errorTypes.ENTITY_NOT_FOUND
            )
          );
      }
      existingUser.status =
        existingUser.status === OPTIONS.defaultStatus.ACTIVE
          ? OPTIONS.defaultStatus.INACTIVE
          : OPTIONS.defaultStatus.ACTIVE;
      await existingUser.save();

      res.status(resCode.HTTP_OK).json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.STATUS_CHANGE(
            'User',
            existingUser.status
          ),
        })
      );
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  delete: async (req, res) => {
    try {
      let query = {
        where: {
          id: req.params.id,
        },
      };
      let existingUser = await User.findOne(query);
      if (existingUser) {
        existingUser.status = OPTIONS.defaultStatus.DELETED;
        existingUser.userName =
          existingUser.userName + Date.now() + OPTIONS.defaultStatus.DELETED;
        await existingUser.save();
        return res.json(
          generateResponse(resCode.HTTP_OK, {
            message: MESSAGES.apiSuccessStrings.DELETED(' User'),
          })
        );
      } else {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('User');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },

  //**User Image delete */
  deleteImage: async (req, res) => {
    try {
      req.assert('id', 'User id is compulsory').notEmpty();
      req.assert('path', 'Image path is compulsory').notEmpty();

      let errors = req.validationErrors();

      if (errors) {
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.INPUT_VALIDATION
            )
          );
      }
      let query = {
        where: {
          status: [
            OPTIONS.defaultStatus.ACTIVE,
            OPTIONS.defaultStatus.INACTIVE,
          ],
          id: req.body.id,
        },
      };
      let existingUser = await User.findOne(query);
      if (!existingUser) {
        let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('The user');
        return res
          .status(resCode.HTTP_BAD_REQUEST)
          .json(
            generateResponse(
              resCode.HTTP_BAD_REQUEST,
              errors,
              MESSAGES.errorTypes.OAUTH_EXCEPTION
            )
          );
      }

      let splitPaths = req.body.path.split('assets');
      let path = `assets${splitPaths[1]}`;
      fs.unlinkSync(path);

      existingUser.image = null;

      await existingUser.save();

      return res.json(
        generateResponse(resCode.HTTP_OK, {
          message: MESSAGES.apiSuccessStrings.DELETED('Image'),
        })
      );
    } catch (e) {
      const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
      res
        .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
        .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
      throw new Error(e);
    }
  },
};
module.exports = userObj;
