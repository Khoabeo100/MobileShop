const modelNotication = require('../models/notication.model');

const { OK } = require('../core/success.response');

class noticationController {
    async getNotication(req, res) {
        const notication = await modelNotication.findAll({
            where: {
                idPayment: '0',
            },
        });
        new OK({
            message: 'Lấy thông báo thành công',
            metadata: notication,
        }).send(res);
    }

    async getNoticationByUserId(req, res) {
        const { id } = req.user;
        const notication = await modelNotication.findAll({ where: { userId: id } });
        new OK({
            message: 'Lấy thông báo thành công',
            metadata: notication,
        }).send(res);
    }

    async readAllNotication(req, res) {
        const { id } = req.user;
        await modelNotication.update({ isRead: '1' }, { where: { userId: id } });
        new OK({
            message: 'Đánh dấu thông báo đã đọc thành công',
        }).send(res);
    }
}

module.exports = new noticationController();
