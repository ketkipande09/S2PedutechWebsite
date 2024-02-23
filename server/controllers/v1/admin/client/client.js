const sequelize = require('sequelize');
const Client = require('../../../../models').Client;
const db = require('../../../../models');
const moment = require('moment');
const fs = require('fs');
const {
    OPTIONS,
    generateResponse,
} = require('../../../../config/options/global.options');
const MESSAGES = require('../../../../config/options/messages.options');

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const ClientObj = {

    createClient: async (req, res) => {
        try {
            let query = {
                where: {
                    [Op.or]: [{ name: req.body.name }],
                },
            };

            let existingSlider = await Client.findOne(query);
            var createObj = new Client();
            var clientObj = req.body;
            if (req.file) {
                clientObj.image = req.file.filename;
            }
            Object.keys(clientObj).forEach((key, index) => {
                createObj[key] = clientObj[key];
            });
            let client = await createObj.save();
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`client added`),
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

    getClientListing: async (req, res) => {
        try {
            let offset = req.query.page || 1;
            offset = offset - 1;
            offset = offset * req.query.pagesize || 0;
            let limit = req.query.pagesize || 15;
            let whereQuery;
            if (req.query.search) {
                whereQuery = {
                    [Op.and]: [
                        { status: OPTIONS.defaultStatus.ACTIVE },
                        {
                            [Op.or]: [
                                { studentName: { [Op.substring]: req.query.search } },
                                { collegeName: { [Op.substring]: req.query.search } },
                            ],
                        },
                    ],
                };
            }
            let { count, rows } = await Client.findAndCountAll({
                where: whereQuery,
                offset: parseInt(offset),
                limit: parseInt(limit),
            });
            if (!rows) {
                return res.status(resCode.HTTP_BAD_REQUEST).json(
                    generateResponse(resCode.HTTP_BAD_REQUEST, {
                        message: MESSAGES.apiSuccessStrings.Client('empty'),
                    })
                );
            }
            let payload = {
                count: count,
                client: rows,
            };
            return res
                .status(resCode.HTTP_OK)
                .json(generateResponse(resCode.HTTP_OK, payload));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res
                .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
                .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
            throw new Error(e);
        }
    },

    updateClient: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }

            let query = {
                where: {
                    id: req.params.id || req.query.id,
                },
            };

            let client = await Client.findOne(query);

            if (!client) {
                if (req.file.filename) {
                    let path = `assets/client/${req.file.filename}`;
                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }
                }
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
                var clientObject = req.body;
                if (req.file) {
                    if (client.image && client.image != 'undefined') {
                        let path = `assets/client/${client.image.split('client/')[1]
                            }`;
                        if (fs.existsSync(path)) {
                            fs.unlinkSync(path);
                        }
                    }
                    clientObject.image = req.file.filename;
                }

                Object.keys(clientObject).forEach((key, index) => {
                    client[key] = clientObject[key];
                });
                await client.save();
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.UPDATE('This Detail'),
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

    getClientById: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }
            let query = {
                where: {
                    id: id,
                },
            };
            let existingClient = await Client.findOne(query);
            if (!existingClient) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
            return res
                .status(resCode.HTTP_OK)
                .json(generateResponse(resCode.HTTP_OK, existingClient));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res
                .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
                .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
            throw new Error(e);
        }
    },

    deleteClient: async (req, res) => {
        try {
            let id = req.params.id;
            if (!id) {
                const error = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, error));
            }
            let query = {
                where: {
                    id: req.params.id || req.query.id,
                },
            };
            let item = await Client.findOne(query);
            let imagePath;
            if (item.image && item.image != 'undefined') {
                imagePath = item.image;
            }
            let client = await Client.destroy(query);
            if (client) {
                if (imagePath) {
                    let path = `assets/client/${imagePath.split('client/')[1]}`;

                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }
                }
                return res.json(
                    generateResponse(resCode.HTTP_OK, {
                        message: MESSAGES.apiSuccessStrings.DELETED('This Details'),
                    })
                );
            } else {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS('This Detail');
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
};
module.exports = ClientObj;