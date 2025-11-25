const modelProduct = require('../models/products.model');
const modelPreviewProduct = require('../models/previewProduct.model');
const modelUser = require('../models/users.model');

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');
const { Op } = require('sequelize');

class controllerProducts {
    async uploadsImage(req, res) {
        const files = req.files;
        if (!files) {
            throw new BadRequestError('Vui lòng upload ảnh');
        }
        const images = files.map((file) => {
            return {
                url: file.filename,
            };
        });
        new Created({ message: 'Upload ảnh thành công', metadata: images }).send(res);
    }

    async createProduct(req, res) {
        const {
            nameProduct,
            priceProduct,
            descriptionProduct,
            categoryProduct,
            specsProduct,
            imagesProduct,
            discountProduct,
            stockProduct,
        } = req.body;
        if (
            !nameProduct ||
            !priceProduct ||
            !descriptionProduct ||
            !categoryProduct ||
            !specsProduct ||
            !imagesProduct
        ) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const product = await modelProduct.create({
            nameProduct,
            priceProduct,
            descriptionProduct,
            categoryProduct,
            specsProduct,
            imagesProduct,
            discountProduct,
            stockProduct,
        });
        new Created({ message: 'Tạo sản phẩm thành công', metadata: product }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findByPk(id);
        if (!product) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }
        const productRelate = await modelProduct.findAll({
            where: {
                categoryProduct: product.categoryProduct,
            },
            limit: 8,
            order: [['createdAt', 'DESC']],
        });

        const previewProduct = await modelPreviewProduct.findAll({
            where: { productId: id },
        });

        const dataPreview = await Promise.all(
            previewProduct.map(async (item) => {
                const user = await modelUser.findByPk(item.userId);
                return {
                    ...item.dataValues,
                    user,
                };
            }),
        );

        new OK({
            message: 'Lấy sản phẩm thành công',
            metadata: { product, productRelate, previewProduct: dataPreview },
        }).send(res);
    }

    async searchProduct(req, res) {
        const { q } = req.query;

        const products = await modelProduct.findAll({
            where: {
                nameProduct: {
                    [Op.like]: `%${q}%`,
                },
            },
        });

        new OK({
            message: 'Tìm kiếm sản phẩm thành công',
            metadata: products,
        }).send(res);
    }

    async updateProduct(req, res) {
        const {
            id,
            nameProduct,
            priceProduct,
            descriptionProduct,
            categoryProduct,
            specsProduct,
            imagesProduct,
            discountProduct,
            stockProduct,
        } = req.body;
        const product = await modelProduct.findByPk(id);
        if (!product) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }
        await product.update({
            nameProduct,
            priceProduct,
            descriptionProduct,
            categoryProduct,
            specsProduct,
            imagesProduct,
            discountProduct,
            stockProduct,
        });
        new OK({ message: 'Cập nhật sản phẩm thành công', metadata: product }).send(res);
    }

    async getAllProducts(req, res) {
        const products = await modelProduct.findAll();
        new OK({ message: 'Lấy tất cả sản phẩm thành công', metadata: products }).send(res);
    }

    async deleteProduct(req, res) {
        const { id } = req.body;
        const product = await modelProduct.findByPk(id);
        if (!product) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }
        await product.destroy();
        new OK({ message: 'Xóa sản phẩm thành công', metadata: product }).send(res);
    }

    async getProductFlashSale(req, res) {
        const products = await modelProduct.findAll({
            where: {
                discountProduct: { [Op.gt]: 9 },
            },
        });
        new OK({ message: 'Lấy sản phẩm giảm giá thành công', metadata: products }).send(res);
    }

    async getProductByCategory(req, res) {
        const { id } = req.query;
        const products = await modelProduct.findAll({
            where: { categoryProduct: id },
        });
        new OK({ message: 'Lấy sản phẩm thành công', metadata: products }).send(res);
    }
}

module.exports = new controllerProducts();
