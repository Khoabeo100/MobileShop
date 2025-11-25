const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');

const modelWebsite = require('../models/website.model');

class WebsiteController {
    async createBanner(req, res) {
        try {
            const files = req.file;

            const data = await modelWebsite.create({
                banner: files.filename,
            });

            res.status(200).json({
                message: 'Create website successfully',
                data,
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async deleteBanner(req, res) {
        const { id } = req.body;
        const data = await modelWebsite.destroy({ where: { id } });
        res.status(200).json({
            message: 'Delete banner successfully',
            data,
        });
    }

    async getBanner(req, res) {
        const data = await modelWebsite.findAll();
        res.status(200).json({
            message: 'Get banner successfully',
            data,
        });
    }
}

module.exports = new WebsiteController();
