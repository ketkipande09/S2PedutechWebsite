const sequelize = require("sequelize");
const Cart = require("../../../../models").Cart;
const CartItem = require("../../../../models").CartItem;
const ShopInventory = require("../../../../models").ShopInventory;
const db = require("../../../../models");
const moment = require("moment");
const {OPTIONS, generateResponse} = require("../../../../config/options/global.options");
const MESSAGES = require("../../../../config/options/messages.options");

const resCode = MESSAGES.resCode;
const Op = sequelize.Op;

const cartObj = {
    
    addToCart: async (req, res) => {
        try {
            req.assert("items", "items Cannot be blank").notEmpty();
            req.assert("items", "items Cannot be empty").isArray({min: 1});

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.INPUT_VALIDATION));
            }

            let items = req.body.items;

            let existingCart = await Cart.findOne({
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    createdById: req.user.id,
                },
            });

            if (!existingCart) {
                existingCart = await Cart.create({
                    createdById: req.user.id,
                });
            }

            let itemsArray = [];
            let subTotal = 0;

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let existingEntry = await CartItem.findOne({
                    where: {
                        status: OPTIONS.defaultStatus.ACTIVE,
                        shopInventoryId: item.id,
                        cartId: existingCart.id,
                    },
                });

                let product = await ShopInventory.findOne({
                    where: {
                        id: item.id,
                    },
                });
                if (!product) {
                    continue;
                }
                if (existingEntry) {
                    existingEntry.quantity += item.quantity;
                    let calculatedPrice = product.price - product.discountPercentage / 100;
                    subTotal +=
                        product.discountPercentage > 0
                            ? calculatedPrice * item.quantity
                            : product.price * item.quantity;
                    existingEntry.save().then();
                } else {
                    let data = {
                        quantity: item.quantity,
                        shopInventoryId: item.id,
                        createdById: req.user.id,
                        cartId: existingCart.id,
                    };
                    itemsArray.push(data);
                    let calculatedPrice = product.price - product.discountPercentage / 100;
                    subTotal +=
                        product.discountPercentage > 0
                            ? calculatedPrice * item.quantity
                            : product.price * item.quantity;
                }
            }

            await CartItem.bulkCreate(itemsArray);

            existingCart.subTotal += subTotal;
            existingCart.total = existingCart.subTotal;
            await existingCart.save();

            return res
                .status(resCode.HTTP_OK)
                .json(generateResponse(resCode.HTTP_OK, {message: MESSAGES.apiSuccessStrings.ADDED("Item")}));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
    updateCartItemQuantity: async (req, res) => {
        try {
            let id = req.params.id;

            req.assert("quantity", "Quantity cannot be blank").notEmpty();

            let errors = req.validationErrors();

            if (errors) {
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, OPTIONS.errorTypes.INPUT_VALIDATION));
            }
            let quantity = parseInt(req.body.quantity);

            let existingEntry = await CartItem.findOne({
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    id: id,
                    createdById: req.user.id,
                },
            });

            if (!existingEntry) {
                let errors = MESSAGES.apiSuccessStrings.DATA_NOT_EXISTS("This product");
                return res
                    .status(resCode.HTTP_BAD_REQUEST)
                    .json(generateResponse(resCode.HTTP_BAD_REQUEST, errors, MESSAGES.errorTypes.OAUTH_EXCEPTION));
            } else {
                let existingCart = await Cart.findOne({
                    where: {
                        status: OPTIONS.defaultStatus.ACTIVE,
                        id: existingEntry.cartId,
                    },
                });
                let product = await ShopInventory.findOne({
                    where: {
                        id: existingEntry.shopInventoryId,
                    },
                });

                //Reset
                let calculatedPrice = product.price - product.discountPercentage / 100;
                let subTotal =
                    product.discountPercentage > 0
                        ? calculatedPrice * existingEntry.quantity
                        : product.price * existingEntry.quantity;
                existingCart.subTotal -= subTotal;
                existingEntry.quantity = quantity;

                //Update
                subTotal =
                    product.discountPercentage > 0
                        ? calculatedPrice * existingEntry.quantity
                        : product.price * existingEntry.quantity;
                existingCart.subTotal += subTotal;
                existingCart.total = existingCart.subTotal;
                await existingCart.save();
                await existingEntry.save();

                return res
                    .status(resCode.HTTP_OK)
                    .json(generateResponse(resCode.HTTP_OK, {message: MESSAGES.apiSuccessStrings.UPDATE("Item")}));
            }
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
    deleteCartItem: async (req, res) => {
        try {
            let id = req.params.id;
            let existingEntry = await CartItem.findOne({
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    id: parseInt(id),
                },
            });

            if (existingEntry) {
                await existingEntry.update({status: OPTIONS.defaultStatus.DELETED});

                let product = await ShopInventory.findOne({
                    where: {
                        status: OPTIONS.defaultStatus.ACTIVE,
                        id: existingEntry.shopInventoryId,
                    },
                });

                let existingCart = await Cart.findOne({
                    where: {
                        status: OPTIONS.defaultStatus.ACTIVE,
                        id: existingEntry.cartId,
                    },
                });
                let calculatedPrice = product.price - product.discountPercentage / 100;

                let subTotal =
                    product.discountPercentage > 0
                        ? calculatedPrice * existingEntry.quantity
                        : product.price * existingEntry.quantity;
                existingCart.subTotal -= subTotal;
                existingCart.total -= subTotal;

                await existingCart.save();

                return res
                    .status(resCode.HTTP_OK)
                    .json(generateResponse(resCode.HTTP_OK, {message: MESSAGES.apiSuccessStrings.DELETED("Item")}));
            } else {
                let errors = MESSAGES.apiErrorStrings.INVALID_REQUEST;
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
    getCartListing: async (req, res) => {
        try {
            let order = [];

            if (order.length === 0) {
                order.push(["createdAt", "DESC"]);
            }

            let whereQuery = {
                status: OPTIONS.defaultStatus.ACTIVE,
                createdById: req.user.id,
            };

            let query = {
                where: whereQuery,
            };

            let cart = await Cart.findOne(query);
            if (!cart) {
                return res.status(resCode.HTTP_BAD_REQUEST).json(
                    generateResponse(resCode.HTTP_BAD_REQUEST, {
                        message: MESSAGES.apiSuccessStrings.CART_ITEM("are empty"),
                    })
                );
            }
            let cartItemWhereQuery = {
                status: OPTIONS.defaultStatus.ACTIVE,
                cartId: cart.id,
            };
            let cartItemQuery = {
                where: cartItemWhereQuery,
                order: order,
                offset: parseInt(req.query.start) || 0,
                limit: parseInt(req.query.length) || 10,
                include: [
                    {
                        model: db.ShopInventory,
                        required: true,
                        where: {status: OPTIONS.defaultStatus.ACTIVE},
                        as: "shopInventory",
                        attributes: [
                            "image",
                            "id",
                            "price",
                            "units",
                            "discountPercentage",
                            "unitType",
                            "name",
                            "description",
                            "sellingUnits",
                            "productCode",
                            "showPrice",
                        ],
                    },
                ],
                attributes: ["quantity", "id"],
            };

            let cartItem = await CartItem.findAll(cartItemQuery);

            let cartData = {
                cartItems: cartItem,
                cart: cart,
            };
            return res.status(resCode.HTTP_OK).json(generateResponse(resCode.HTTP_OK, cartData));
        } catch (e) {
            const errors = MESSAGES.apiErrorStrings.SERVER_ERROR;
            res.status(resCode.HTTP_INTERNAL_SERVER_ERROR).json(
                generateResponse(resCode.HTTP_INTERNAL_SERVER_ERROR, errors)
            );
            throw new Error(e);
        }
    },
    deleteCart: async (req, res) => {
        try {
            let id = req.params.id;
            let existingCart = await Cart.findOne({
                where: {
                    status: OPTIONS.defaultStatus.ACTIVE,
                    id: parseInt(id),
                },
            });

            if (existingCart) {
                await existingCart.update({status: OPTIONS.defaultStatus.DELETED});
                return res
                    .status(resCode.HTTP_OK)
                    .json(generateResponse(resCode.HTTP_OK, {message: MESSAGES.apiSuccessStrings("Cart")}));
            } else {
                let errors = MESSAGES.apiErrorStrings.INVALID_REQUEST;
                return res.status(resCode.HTTP_BAD_REQUEST).json(generateResponse(resCode.HTTP_BAD_REQUEST, errors));
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
module.exports = cartObj;
