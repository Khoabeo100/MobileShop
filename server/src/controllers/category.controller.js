const modelCategory = require('../models/category.model');
const modelProduct = require('../models/products.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class categoryController {
    async createCategory(req, res) {
        const { nameCategory } = req.body;
        if (!nameCategory) {
            throw new BadRequestError('Vui lòng nhập tên danh mục');
        }
        const category = await modelCategory.create({ nameCategory });
        new OK({ message: 'Tạo danh mục thành công', metadata: category }).send(res);
    }

    async getCategories(req, res) {
        const categories = await modelCategory.findAll();
        const data = await Promise.all(
            categories.map(async (category) => {
                const products = await modelProduct.findAll({ where: { categoryProduct: category.id } });
                return { ...category.dataValues, products };
            }),
        );

        new OK({ message: 'Lấy danh mục thành công', metadata: data }).send(res);
    }

    async updateCategory(req, res) {
        const { id } = req.body;
        const { nameCategory } = req.body;
        const category = await modelCategory.findByPk(id);
        if (!category) {
            throw new NotFoundError('Danh mục không tồn tại');
        }
        category.nameCategory = nameCategory;
        await category.save();
        new OK({ message: 'Cập nhật danh mục thành công', metadata: category }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.body;
        const category = await modelCategory.findByPk(id);
        if (!category) {
            throw new NotFoundError('Danh mục không tồn tại');
        }
        await category.destroy();
        new OK({ message: 'Xoá danh mục thành công', metadata: category }).send(res);
    }
}

module.exports = new categoryController();
