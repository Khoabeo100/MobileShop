const modelCoupon = require('../models/counpon.model');
const modelCart = require('../models/cart.model');

const { AuthFailureError, BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class CouponController {
    async createCoupon(req, res) {
        const { nameCoupon, discount, quantity, startDate, endDate, minPrice } = req.body;
        if (!nameCoupon || !discount || !quantity || !startDate || !endDate || !minPrice) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }
        const newCoupon = await modelCoupon.create({
            nameCoupon,
            discount,
            quantity,
            startDate,
            endDate,
            minPrice,
        });
        return res.status(201).json({ message: 'Tạo mã giảm giá thành công', data: newCoupon });
    }

    async getAllCoupon(req, res) {
        const coupons = await modelCoupon.findAll();
        return res.status(200).json({ message: 'Lấy tất cả mã giảm giá thành công', data: coupons });
    }

    async updateCoupon(req, res) {
        const { id, nameCoupon, discount, quantity, startDate, endDate, minPrice } = req.body;
        await modelCoupon.update(
            {
                nameCoupon,
                discount,
                quantity,
                startDate,
                endDate,
                minPrice,
            },
            { where: { id } },
        );
        new OK({
            message: 'Cập nhật mã giảm giá thành công',
        }).send(res);
    }

    async deleteCoupon(req, res) {
        const { id } = req.body;
        await modelCoupon.destroy({ where: { id } });
        new OK({
            message: 'Xóa mã giảm giá thành công',
        }).send(res);
    }

    async addCouponToCart(req, res) {
        const { id } = req.user;
        const { idCoupon } = req.body;
        const findCoupon = await modelCoupon.findOne({ where: { id: idCoupon } });
        if (!findCoupon) {
            throw new NotFoundError('Mã giảm giá không tồn tại');
        }
        const findCart = await modelCart.findAll({ where: { userId: id } });
        const updateCart = await Promise.all(
            findCart.map(async (item) => {
                item.nameCoupon = findCoupon.nameCoupon;
                return await item.save();
            }),
        );
        new OK({
            message: 'Thêm mã giảm giá vào giỏ hàng thành công',
            metadata: updateCart,
        }).send(res);
    }
}

module.exports = new CouponController();
