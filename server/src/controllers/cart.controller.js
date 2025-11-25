const modelCart = require('../models/cart.model');
const modelProduct = require('../models/products.model');
const modelCoupon = require('../models/counpon.model');

const { AuthFailureError, BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const { Op } = require('sequelize');

class CartController {
    async createCart(req, res) {
        const { id } = req.user;
        const { productId, quantity } = req.body;
        const product = await modelProduct.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundError('Product not found');
        }
        const cart = await modelCart.findOne({ where: { userId: id, productId } });
        if (cart) {
            cart.quantity += quantity;
            cart.totalPrice = product.priceProduct * cart.quantity;
            await cart.save();
        } else {
            await modelCart.create({ userId: id, productId, quantity, totalPrice: product.priceProduct * quantity });
        }
        await modelProduct.update({ stockProduct: product.stockProduct - quantity }, { where: { id: productId } });
        new OK({
            message: 'Thêm vào giỏ hàng thành công',
            metadata: cart,
        }).send(res);
    }

    async getCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findAll({ where: { userId: id } });
        const totalPrice = cart.reduce((acc, item) => acc + item.totalPrice, 0);
        const today = new Date();

        // Tìm coupon phù hợp
        const coupon = await modelCoupon.findAll({
            where: {
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today },
                quantity: { [Op.gt]: 0 },
                minPrice: { [Op.lte]: totalPrice },
            },
        });
        const data = await Promise.all(
            cart.map(async (item) => {
                const product = await modelProduct.findOne({ where: { id: item.productId } });

                return {
                    ...item.dataValues,
                    product,
                };
            }),
        );
        new OK({
            message: 'Lấy giỏ hàng thành công',
            metadata: {
                cart: data,
                coupon,
            },
        }).send(res);
    }

    async updateQuantity(req, res) {
        const { id } = req.user;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            throw new BadRequestError('Missing required fields');
        }

        if (quantity <= 0) {
            throw new BadRequestError('Quantity must be greater than 0');
        }

        // Find cart item
        const cartItem = await modelCart.findOne({
            where: { userId: id, productId },
        });

        if (!cartItem) {
            throw new BadRequestError('Cart item not found');
        }

        // Find product to calculate new price
        const product = await modelProduct.findOne({
            where: { id: productId },
        });

        if (!product) {
            throw new BadRequestError('Product not found');
        }

        // Update cart item
        const updateData = {
            quantity,
            totalPrice: product.priceProduct * quantity,
        };

        await cartItem.update(updateData);

        new OK({
            message: 'Cập nhật giỏ hàng thành công',
            metadata: cartItem,
        }).send(res);
    }

    async removeCartItem(req, res) {
        const { id } = req.user;
        const { productId } = req.body;

        if (!productId) {
            throw new BadRequestError('Missing product ID');
        }

        // Find cart item
        const cartItem = await modelCart.findOne({
            where: { userId: id, productId },
        });

        if (!cartItem) {
            throw new BadRequestError('Cart item not found');
        }

        const product = await modelProduct.findOne({ where: { id: productId } });
        // Delete cart item
        await cartItem.destroy();
        await modelProduct.update(
            { stockProduct: product.stockProduct + cartItem.quantity },
            { where: { id: productId } },
        );

        new OK({
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            metadata: { productId },
        }).send(res);
    }

    async updateInfoCart(req, res) {
        const { id } = req.user;
        const { fullName, phoneNumber, address, nameCoupon } = req.body;
        const cart = await modelCart.findOne({ where: { userId: id } });
        if (!cart) {
            throw new BadRequestError('Không có sản phẩm trong giỏ hàng');
        }
        cart.fullName = fullName;
        cart.phoneNumber = phoneNumber;
        cart.address = address;
        cart.nameCoupon = nameCoupon;
        await cart.save();
        new OK({
            message: 'Cập nhật thông tin giỏ hàng thành công',
            metadata: cart,
        }).send(res);
    }

    async getInfoCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findAll({
            where: { userId: id },
        });
        let totalPrice = 0;
        let discount = 0;

        if (cart.length === 0) {
            throw new NotFoundError('Không có sản phẩm trong giỏ hàng');
        }

        if (cart[0].nameCoupon) {
            const coupon = await modelCoupon.findOne({ where: { nameCoupon: cart[0].nameCoupon } });
            discount = coupon.discount;
        }

        const data = await Promise.all(
            cart.map(async (item) => {
                const product = await modelProduct.findOne({ where: { id: item.productId } });
                return {
                    ...item.dataValues,
                    product,
                };
            }),
        );

        new OK({
            message: 'Lấy thông tin giỏ hàng thành công',
            metadata: {
                cart: data,
                totalPrice: data.reduce((acc, item) => acc + item.totalPrice, 0),
                discount,
            },
        }).send(res);
    }
}

module.exports = new CartController();
