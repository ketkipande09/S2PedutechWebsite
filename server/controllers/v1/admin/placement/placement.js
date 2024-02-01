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
            let query = {
                where: {
                    [Op.or]: [{ name: req.body.name }],
                },
            };

            let existingSlider = await Placement.findOne(query);
            var createObj = new Placement();
            var PlacementObj = req.body;
            if (req.file) {
                Placement.image = req.file.filename;
            }
            Object.keys(Placement).forEach((key, index) => {
                createObj[key] = Placement[key];
            });
            let client = await createObj.save();
            return res.status(resCode.HTTP_OK).json(
                generateResponse(resCode.HTTP_OK, {
                    message: MESSAGES.apiSuccessStrings.ADDED(`Placement added`),
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
                    let path = `assets/image/${req.file.filename}`;
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
                        let path = `assets/placementImage/${placement.image.split('placementImage/')[1]
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
                    let path = `assets/image/${imagePath.split('image/')[1]}`;

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