const modelCart = require('../models/cart.model');
const modelPayments = require('../models/payments.model');
const modelProduct = require('../models/products.model');
const modelCoupon = require('../models/counpon.model');
const modelUser = require('../models/users.model');
const modelPreviewProduct = require('../models/previewProduct.model');
const modelNotication = require('../models/notication.model');

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

const socketService = require('../services/socketService');

async function createNotication(content, userId, idPayment) {
    const notication = await modelNotication.create({
        content,
        userId: userId || '0',
        idPayment: idPayment || '0',
    });

    return notication;
}

function generatePayID() {
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

async function detailOrder(payment) {
    const data = await Promise.all(
        payment.map(async (item) => {
            const findUser = await modelUser.findOne({ where: { id: item.userId } });
            const findProduct = await modelProduct.findOne({ where: { id: item.productId } });
            return {
                ...item.dataValues,
                user: findUser,
                product: findProduct,
            };
        }),
    );
    return data;
}

class PaymentsController {
    async createPayment(req, res) {
        const { id } = req.user;
        const { typePayment, fullName, phoneNumber, address, email, note } = req.body;
        const findCart = await modelCart.findAll({ where: { userId: id } });

        await modelCart.update({ fullName, phoneNumber, address, email, note }, { where: { userId: id } });

        if (!findCart) {
            throw new BadRequestError('Không có sản phẩm trong giỏ hàng');
        }
        if (fullName === '' || phoneNumber === '' || address === '') {
            throw new BadRequestError('Vui lòng cập nhật thông tin đơn hàng');
        }

        let totalPrice = 0;
        for (const item of findCart) {
            const product = await modelProduct.findOne({ where: { id: item.productId } });
            if (product) {
                const discountedPrice =
                    product.discountProduct > 0
                        ? product.priceProduct * (1 - product.discountProduct / 100)
                        : product.priceProduct;
                totalPrice += discountedPrice * item.quantity;
            }
        }
        let discount = 0;
        if (findCart[0].nameCoupon) {
            const findCounpon = await modelCoupon.findOne({ where: { nameCoupon: findCart[0].nameCoupon } });
            discount = findCounpon.discount;
        }

        // xử lý thanh toán theo checkout
        // const product = await modelProduct.findOne({ where: { id: item.productId } });

        // const unitPrice = product.priceProduct;

        // const finalPrice = product.discountProduct > 0 ? unitPrice * (1 - product.discountProduct / 100) : unitPrice;

        // const totalPrice = finalPrice * item.quantity;
        // kết thúc xử lý thanh toán theo checkout

        if (typePayment === 'cod') {
            const paymentId = generatePayID();
            const payment = await Promise.all(
                findCart.map(async (item) => {
                    const findProduct = await modelProduct.findOne({ where: { id: item.productId } });

                    await createNotication(
                        `${fullName} đã đặt hàng thành công ${findProduct.nameProduct}`,
                        id,
                        paymentId,
                    );

                    return await modelPayments.create({
                        idPayment: paymentId,
                        userId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        // totalPrice: item.totalPrice,
                        totalPrice: totalPrice,
                        fullName: fullName,
                        phoneNumber: phoneNumber,
                        address: address,
                        status: 'pending',
                        typePayment: typePayment,
                        nameCoupon: findCart[0].nameCoupon,
                        note: note,
                        email: email,
                    });
                }),
            );

            if (findCart[0].nameCoupon) {
                const findCounpon = await modelCoupon.findOne({ where: { nameCoupon: findCart[0].nameCoupon } });
                await modelCoupon.update(
                    { quantity: findCounpon.quantity - 1 },
                    { where: { nameCoupon: findCart[0].nameCoupon } },
                );
            }
            await modelCart.destroy({ where: { userId: id } });

            new OK({
                message: 'Create payment success',
                metadata: payment,
            }).send(res);
        } else if (typePayment === 'momo') {
            const accessKey = 'F8BBA842ECF85';
            const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            const orderInfo = `Thanh toan don hang ${id}`;
            const partnerCode = 'MOMO';
            const redirectUrl = 'http://localhost:3001/api/payments/momo';
            const ipnUrl = 'http://localhost:3001/api/payments/momo';
            const requestType = 'payWithMethod';
            const amount = discount > 0 ? totalPrice - (totalPrice * discount) / 100 : totalPrice;
            const orderId = partnerCode + new Date().getTime();
            const requestId = orderId;
            const extraData = `${id}`;
            const orderGroupId = '';
            const autoCapture = true;
            const lang = 'vi';

            //before sign HMAC SHA256 with format
            //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            const rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;
            //puts raw signature
            console.log('--------------------RAW SIGNATURE----------------');
            console.log(rawSignature);
            //signature
            const crypto = require('crypto');
            const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
            console.log('--------------------SIGNATURE----------------');
            console.log(signature);

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                partnerName: 'Test',
                storeId: 'MomoTestStore',
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                lang: lang,
                requestType: requestType,
                autoCapture: autoCapture,
                extraData: extraData,
                orderGroupId: orderGroupId,
                signature: signature,
            });
            //Create the HTTPS objects
            const https = require('https');
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody),
                },
            };
            //Send the request and get the response
            const req2 = https.request(options, (res2) => {
                console.log(`Status: ${res2.statusCode}`);
                console.log(`Headers: ${JSON.stringify(res2.headers)}`);
                let responseBody = '';
                res2.setEncoding('utf8');
                res2.on('data', (chunk) => {
                    responseBody += chunk;
                });
                res2.on('end', () => {
                    try {
                        const result = JSON.parse(responseBody);
                        if (result.payUrl) {
                            new OK({
                                message: 'Create payment success',
                                metadata: { payUrl: result.payUrl },
                            }).send(res);
                        } else {
                            console.error('MoMo response error', result);
                            return res.status(500).json({ message: 'MoMo payment creation failed', error: result });
                        }
                    } catch (error) {
                        console.error('MoMo parse error', error);
                        return res.status(500).json({ message: 'MoMo response parse failed' });
                    }
                });
            });

            req2.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                return res.status(500).json({ message: 'MoMo request error', error: e.message });
            });
            // write data to request body
            console.log('Sending....');
            req2.write(requestBody);
            req2.end();
        } else if (typePayment === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tuỳ chọn
                hashAlgorithm: 'SHA512', // tuỳ chọn
                loggerFn: ignoreLogger, // tuỳ chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: discount > 0 ? totalPrice - (totalPrice * discount) / 100 : totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${findCart[0]?.userId} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `Thanh toan don hang ${findCart[0]?.userId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3001/api/payments/vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tuỳ chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tuỳ chọn
            });
            new OK({ message: 'Thanh toán thông báo', metadata: vnpayResponse }).send(res);
        } else if (typePayment === 'qr') {
        }
    }

    async momoCallback(req, res) {
        const { orderInfo, resultCode, extraData } = req.method === 'POST' ? req.body : req.query;
        const id = extraData || orderInfo?.split(' ').pop();

        if (resultCode === '0' && id) {
            const findCart = await modelCart.findAll({ where: { userId: id } });
            if (!findCart?.length) {
                return res.redirect('http://localhost:5175/payment-failed');
            }

            const paymentId = generatePayID();
            const data = await Promise.all(
                findCart.map(async (item) => {
                    return await modelPayments.create({
                        idPayment: paymentId,
                        userId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        totalPrice: item.totalPrice,
                        fullName: item.fullName,
                        phoneNumber: item.phoneNumber,
                        address: item.address,
                        status: 'pending',
                        typePayment: 'momo',
                        nameCoupon: item.nameCoupon,
                        note: item.note,
                        email: item.email,
                    });
                }),
            );

            if (findCart[0].nameCoupon) {
                const findCounpon = await modelCoupon.findOne({ where: { nameCoupon: findCart[0].nameCoupon } });
                if (findCounpon) {
                    await modelCoupon.update(
                        { quantity: findCounpon.quantity - 1 },
                        { where: { nameCoupon: findCart[0].nameCoupon } },
                    );
                }
            }
            await detailOrder(data);
            await modelCart.destroy({ where: { userId: id } });
            return res.redirect(`http://localhost:5175/payment-success/${paymentId}`);
        }

        return res.redirect('http://localhost:5175/payment-failed');
    }

    async vnpayCallback(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        if (vnp_ResponseCode === '00') {
            const id = vnp_OrderInfo.split(' ')[4];
            const paymentId = generatePayID();
            const findCart = await modelCart.findAll({ where: { userId: id } });
            const data = await Promise.all(
                findCart.map(async (item) => {
                    return await modelPayments.create({
                        idPayment: paymentId,
                        userId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        totalPrice: item.totalPrice,
                        fullName: item.fullName,
                        phoneNumber: item.phoneNumber,
                        address: item.address,
                        status: 'pending',
                        typePayment: 'vnpay',
                        nameCoupon: item.nameCoupon,
                        note: item.note,
                        email: item.email,
                    });
                }),
            );
            if (findCart[0].nameCoupon) {
                const findCounpon = await modelCoupon.findOne({ where: { nameCoupon: findCart[0].nameCoupon } });
                if (findCounpon) {
                    await modelCoupon.update(
                        { quantity: findCounpon.quantity - 1 },
                        { where: { nameCoupon: findCart[0].nameCoupon } },
                    );
                }
            }
            await detailOrder(data);
            await modelCart.destroy({ where: { userId: id } });
            res.redirect(`http://localhost:5175/payment-success/${paymentId}`);
        }
    }

    async getPaymentById(req, res) {
        const { id } = req.query;
        const payment = await modelPayments.findAll({ where: { idPayment: id } });
        let coupon = null;
        const data = await Promise.all(
            payment.map(async (item) => {
                const product = await modelProduct.findOne({ where: { id: item.productId } });
                if (payment[0].dataValues.nameCoupon) {
                    coupon = await modelCoupon.findOne({ where: { nameCoupon: payment[0].dataValues.nameCoupon } });
                }
                return {
                    ...item.dataValues,
                    product: product,
                    coupon: coupon,
                };
            }),
        );
        new OK({
            message: 'Get payment by id success',
            metadata: data,
        }).send(res);
    }

    // async getPaymentsByUserId(req, res) {
    //     const { id } = req.user;
    //     const payments = await modelPayments.findAll({ where: { userId: id } });
    //     const findCoupon = await modelCoupon.findOne({ where: { nameCoupon: payments[0].nameCoupon } });

    //     // Group payments by idPayment
    //     const paymentGroups = {};

    //     for (const payment of payments) {
    //         if (!paymentGroups[payment.idPayment]) {
    //             paymentGroups[payment.idPayment] = {
    //                 id: payment.id,
    //                 idPayment: payment.idPayment,
    //                 userId: payment.userId,
    //                 createdAt: payment.createdAt,
    //                 updatedAt: payment.updatedAt,
    //                 fullName: payment.fullName,
    //                 phoneNumber: payment.phoneNumber,
    //                 address: payment.address,
    //                 nameCoupon: payment.nameCoupon,
    //                 typePayment: payment.typePayment,
    //                 status: payment.status,
    //                 note: payment.note,
    //                 email: payment.email,
    //                 totalPrice: 0,
    //                 items: [],
    //             };
    //         }

    //         // Add product to this group
    //         const product = await modelProduct.findOne({ where: { id: payment.productId } });
    //         const previewProduct = await modelPreviewProduct.findOne({
    //             where: { productId: payment.productId, userId: id },
    //         });
    //         paymentGroups[payment.idPayment].items.push({
    //             productId: payment.productId,
    //             quantity: payment.quantity,
    //             price: payment.totalPrice,
    //             product: product,
    //             note: payment.note,
    //             email: payment.email,
    //             previewProduct: previewProduct,
    //         });

    //         // Sum total price
    //         paymentGroups[payment.idPayment].totalPrice += payment.totalPrice;
    //         paymentGroups[payment.idPayment].totalPrice =
    //             findCoupon.discount > 0
    //                 ? paymentGroups[payment.idPayment].totalPrice -
    //                   (paymentGroups[payment.idPayment].totalPrice * findCoupon.discount) / 100
    //                 : paymentGroups[payment.idPayment].totalPrice;
    //     }

    //     // Convert to array
    //     const groupedPayments = Object.values(paymentGroups);

    //     new OK({
    //         message: 'Get payments by user id success',
    //         metadata: groupedPayments,
    //     }).send(res);
    // }

    async getPaymentsByUserId(req, res) {
        const { id } = req.user;
        const payments = await modelPayments.findAll({ where: { userId: id } });

        // Nếu user chưa có đơn nào thì trả luôn mảng rỗng, tránh payments[0] = undefined
        if (!payments || payments.length === 0) {
            return new OK({
                message: 'Get payments by user id success',
                metadata: [],
            }).send(res);
        }

        // Chỉ tìm coupon nếu có nameCoupon
        let coupon = null;
        const couponName = payments[0]?.nameCoupon;
        if (couponName) {
            coupon = await modelCoupon.findOne({ where: { nameCoupon: couponName } });
        }

        // Group payments by idPayment
        const paymentGroups = {};

        for (const payment of payments) {
            if (!paymentGroups[payment.idPayment]) {
                paymentGroups[payment.idPayment] = {
                    id: payment.id,
                    idPayment: payment.idPayment,
                    userId: payment.userId,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                    fullName: payment.fullName,
                    phoneNumber: payment.phoneNumber,
                    address: payment.address,
                    nameCoupon: payment.nameCoupon,
                    typePayment: payment.typePayment,
                    status: payment.status,
                    note: payment.note,
                    email: payment.email,
                    totalPrice: 0,
                    items: [],
                };
            }

            // Add product to this group
            const product = await modelProduct.findOne({ where: { id: payment.productId } });
            const previewProduct = await modelPreviewProduct.findOne({
                where: { productId: payment.productId, userId: id },
            });

            paymentGroups[payment.idPayment].items.push({
                productId: payment.productId,
                quantity: payment.quantity,
                price: payment.totalPrice,
                product: product,
                note: payment.note,
                email: payment.email,
                previewProduct: previewProduct,
            });

            // Cộng tổng trước
            paymentGroups[payment.idPayment].totalPrice += payment.totalPrice;
        }

        //áp dụng giảm giá sau khi đã cộng xong (nếu có coupon)
        if (coupon && coupon.discount > 0) {
            for (const group of Object.values(paymentGroups)) {
                if (group.nameCoupon) {
                    group.totalPrice = group.totalPrice - (group.totalPrice * coupon.discount) / 100;
                }
            }
        }

        const groupedPayments = Object.values(paymentGroups);

        new OK({
            message: 'Get payments by user id success',
            metadata: groupedPayments,
        }).send(res);
    }

    async cancelPayment(req, res) {
        const { idPayment } = req.body;
        const payment = await modelPayments.findOne({ where: { idPayment: idPayment } });
        if (!payment) {
            throw new NotFoundError('Payment not found');
        }
        await modelPayments.update({ status: 'failed' }, { where: { idPayment: idPayment } });
        new OK({
            message: 'Cancel payment success',
        }).send(res);
    }

    async getPayments(req, res) {
        const payments = await modelPayments.findAll({});
        // Group payments by idPayment
        const paymentGroups = {};

        for (const payment of payments) {
            if (!paymentGroups[payment.idPayment]) {
                paymentGroups[payment.idPayment] = {
                    id: payment.id,
                    idPayment: payment.idPayment,
                    userId: payment.userId,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                    fullName: payment.fullName,
                    phoneNumber: payment.phoneNumber,
                    address: payment.address,
                    nameCoupon: payment.nameCoupon,
                    typePayment: payment.typePayment,
                    status: payment.status,
                    totalPrice: 0,
                    note: payment.note,
                    email: payment.email,
                    items: [],
                };
            }

            // Add product to this group
            const product = await modelProduct.findOne({ where: { id: payment.productId } });
            paymentGroups[payment.idPayment].items.push({
                productId: payment.productId,
                quantity: payment.quantity,
                price: payment.totalPrice,
                product: product,
            });

            // Sum total price
            paymentGroups[payment.idPayment].totalPrice += payment.totalPrice;
        }

        // Convert to array
        const groupedPayments = Object.values(paymentGroups);

        new OK({
            message: 'Get payments by user id success',
            metadata: groupedPayments,
        }).send(res);
    }

    async updateStatus(req, res) {
        const { idPayment, status } = req.body;
        const payment = await modelPayments.findOne({ where: { idPayment } });
        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        // Update trạng thái đơn hàng
        await modelPayments.update({ status }, { where: { idPayment } });

        // Nội dung thông báo theo status
        let content = '';
        switch (status) {
            case 'confirm':
                content = `${payment.fullName} đã xác nhận đơn hàng ${payment.idPayment}`;
                break;
            case 'shipping':
                content = `${payment.fullName} đã bắt đầu vận chuyển ${payment.idPayment}`;
                break;
            case 'success':
                content = `${payment.fullName} đã giao hàng thành công ${payment.idPayment}`;
                break;
            case 'failed':
                content = `${payment.fullName} đã bị huỷ ${payment.idPayment}`;
                break;
            case 'pending':
                content = `${payment.fullName} đã đặt hàng thành công ${payment.idPayment}`;
                break;
        }

        //kiểm tra xem đã có thông báo cho đơn hàng này chưa, nếu có rồi thì cập nhật lại nội dung và thời gian, nếu chưa thì tạo mới
        const oldNoti = await modelNotication.findOne({
            where: { userId: payment.userId, idPayment: payment.idPayment },
        });

        if (oldNoti) {
            // Cập nhật nội dung + thời gian
            await modelNotication.update({ content, updatedAt: new Date() }, { where: { id: oldNoti.id } });
        } else {
            // Tạo mới nếu chưa có
            await createNotication(content, payment.userId, payment.idPayment);
        }

        new OK({ message: 'Update status success' }).send(res);
    }
}

module.exports = new PaymentsController();
