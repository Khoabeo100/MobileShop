const modelFavouriteProduct = require('../models/favouriteProduct.model');
const modelProduct = require('../models/products.model');

const { AuthFailureError, BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class favouriteProductController {
    async addFavouriteProduct(req, res) {
        const { id } = req.user;
        const { productId } = req.body;
        if (!productId) {
            throw new BadRequestError('Vui lòng cung cấp productId');
        }
        const existingFavourite = await modelFavouriteProduct.findOne({ where: { userId: id, productId } });
        if (existingFavourite) {
            throw new BadRequestError('Sản phẩm đã có trong danh sách yêu thích');
        }
        const newFavourite = await modelFavouriteProduct.create({ userId: id, productId });
        return new OK({
            message: 'Product added to favourites successfully',
            data: newFavourite,
        }).send(res);
    }

    async deleteFavouriteProduct(req, res) {
        const { id } = req.user;
        const { productId } = req.body;
        if (!productId) {
            throw new BadRequestError('Vui lòng cung cấp productId');
        }
        const favouriteProduct = await modelFavouriteProduct.findOne({ where: { userId: id, productId } });
        if (!favouriteProduct) {
            throw new NotFoundError('Sản phẩm không có trong danh sách yêu thích');
        }
        await favouriteProduct.destroy();
        return new OK({
            message: 'Product removed from favourites successfully',
        }).send(res);
    }

    async getFavouriteProducts(req, res) {
        const { id } = req.user;
        const findData = await modelFavouriteProduct.findAll({ where: { userId: id } });
        const data = await Promise.all(
            findData.map(async (item) => {
                const product = await modelProduct.findOne({ where: { id: item.productId } });
                return {
                    ...item.dataValues,
                    product,
                };
            }),
        );
        return new OK({
            message: 'Lấy danh sách sản phẩm yêu thích thành công',
            metadata: data,
        }).send(res);
    }
}

module.exports = new favouriteProductController();
