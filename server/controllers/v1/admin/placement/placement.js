const sequelize = require('sequelize');
const Placement = require('../../../../models').Placement;
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

const placementObj = {

    createPlacement: async (req, res) => {
        try {
            console.log("req.body========>", req.body);
            let query = {
                where: {
                    [Op.or]: [{ studentName: req.body.studentName.toLowerCase() }],
                },
            };
            /** check if Course exist or not */
            let existingCourse = await Placement.findOne(query);

            if (existingCourse) {
                let errors = MESSAGES.apiErrorStrings.Data_EXISTS(req.body.name);
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
            var createObj = new Placement(req.body);
            // var courseObj = req.body;
            if (req.file) {
                placementObj.image = req.file.filename;
            }
            Object.keys(placementObj).forEach((key, index) => {
                createObj[key] = placementObj[key];
            });
            let course = await createObj.save();
            // let course = await Course.create(createObj);
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`The Course is`),
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

    getPlacementListing: async (req, res) => {
        try {
            let offset = req.query.page || 1;
            offset = offset - 1;
            offset = offset * req.query.pagesize || 0;
            let limit = req.query.pagesize || 10;
            let whereQuery;
            if (req.query.search) {
                whereQuery = {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { studentName: { [Op.substring]: req.query.search } },
                                { collage: { [Op.substring]: req.query.search } },
                                { company: { [Op.substring]: req.query.search } },
                            ],
                        },
                    ],
                };
            }
            let { count, rows } = await Placement.findAndCountAll({
                where: whereQuery,
                offset: parseInt(offset),
                limit: parseInt(limit),
            });
            if (!rows) {
                return res.status(resCode.HTTP_BAD_REQUEST).json(
                    generateResponse(resCode.HTTP_BAD_REQUEST, {
                        message: MESSAGES.apiSuccessStrings.Placement('empty'),
                    })
                );
            }
            let payload = {
                count: count,
                placement: rows,
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

    updatePlacement: async (req, res) => {
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

            let placement = await Placement.findOne(query);

            if (!placement) {
                if (req.file.filename) {
                    let path = `assets/placement/${req.file.filename}`;
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
                var placementObject = req.body;
                if (req.file) {
                    if (placement.image && placement.image != 'undefined') {
                        let path = `assets/placement/${placement.image.split('placement/')[1]
                            }`;
                        if (fs.existsSync(path)) {
                            fs.unlinkSync(path);
                        }
                    }
                    placementObject.image = req.file.filename;
                }

                Object.keys(placementObject).forEach((key, index) => {
                    placement[key] = placementObject[key];
                });
                await placement.save();
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

    getPlacementById: async (req, res) => {
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
            let existingPlacement = await Placement.findOne(query);
            if (!existingPlacement) {
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
                .json(generateResponse(resCode.HTTP_OK, existingPlacement));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res
                .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
                .json(generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors));
            throw new Error(e);
        }
    },

    deletePlacement: async (req, res) => {
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
            let item = await Placement.findOne(query);
            let imagePath;
            if (item.image && item.image != 'undefined') {
                imagePath = item.image;
            }
            let placement = await Placement.destroy(query);
            if (placement) {
                if (imagePath) {
                    let path = `assets/placement/${imagePath.split('placement/')[1]}`;

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
module.exports = placementObj;