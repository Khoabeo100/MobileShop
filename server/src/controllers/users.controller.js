const modelUser = require('../models/users.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');

const { connect } = require('../config/connectDB');

const sendMailForgotPassword = require('../utils/sendMailForgotPassword');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const { createApiKey, createRefreshToken, createToken, verifyToken } = require('../services/tokenServices');

// const sendMailForgotPassword = require('../utils/sendMailForgotPassword');

const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

require('dotenv').config();

class controllerUser {
    async registerUser(req, res) {
        const { fullName, phone, address, email, password, birthDay } = req.body;
        if (!fullName || !phone || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });

        if (findUser) {
            throw new BadRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        const dataUser = await modelUser.create({
            fullName,
            phone,
            address,
            email,
            password: passwordHash,
            typeLogin: 'email',
            birthDay,
        });

        await dataUser.save();
        await createApiKey(dataUser.id);
        const token = await createToken({
            id: dataUser.id,
            isAdmin: dataUser.isAdmin,
            address: dataUser.address,
            phone: dataUser.phone,
        });
        const refreshToken = await createRefreshToken({ id: dataUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });
        if (!findUser) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = bcrypt.compareSync(password, findUser.password);
        if (!isPasswordValid) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(findUser.id);
        const token = await createToken({ id: findUser.id, isAdmin: findUser.isAdmin });
        const refreshToken = await createRefreshToken({ id: findUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });
        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async authUser(req, res) {
        const { id } = req.user;

        const findUser = await modelUser.findOne({ where: { id } });

        if (!findUser) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }

        const auth = CryptoJS.AES.encrypt(JSON.stringify(findUser), process.env.SECRET_CRYPTO).toString();

        new OK({ message: 'success', metadata: auth }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findOne({ where: { id: decoded.id } });
        const token = await createToken({ id: user.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        await modelApiKey.destroy({ where: { userId: id } });
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');

        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async updateInfoUser(req, res, next) {
        const { id } = req.user;
        const { fullName, address, phone, birthDay } = req.body;

        const user = await modelUser.findOne({ where: { id } });

        let image = '';
        if (req.file) {
            // const result = await cloudinary.uploader.upload(req.file.path);
            // image = result.secure_url;
        } else {
            image = user.avatar;
        }

        if (!user) {
            throw new BadRequestError('Không tìm thấy tài khoản');
        }
        await user.update({ fullName, address, phone, avatar: image, birthDay });

        new OK({ message: 'Cập nhật thông tin tài khoản thành cong' }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ where: { email: dataToken.email } });
        if (user) {
            await createApiKey(user.id);
            const token = await createToken({ id: user.id });
            const refreshToken = await createRefreshToken({ id: user.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser.id);
            const token = await createToken({ id: newUser.id });
            const refreshToken = await createRefreshToken({ id: newUser.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Vui lòng nhập email');
            }

            const user = await modelUser.findOne({ where: { email } });
            if (!user) {
                throw new AuthFailureError('Email không tồn tại');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const otp = await otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });

            const saltRounds = 10;

            bcrypt.hash(otp, saltRounds, async function (err, hash) {
                if (err) {
                    console.error('Error hashing OTP:', err);
                } else {
                    await modelOtp.create({
                        email: user.email,
                        otp: hash,
                    });
                    await sendMailForgotPassword(email, otp);

                    return res
                        .setHeader('Set-Cookie', [
                            `tokenResetPassword=${token};  Secure; Max-Age=300; Path=/; SameSite=Strict`,
                        ])
                        .status(200)
                        .json({ message: 'Gửi thành công !!!' });
                }
            });
        } catch (error) {
            console.error('Error forgot password:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async resetPassword(req, res) {
        try {
            const token = req.cookies.tokenResetPassword;
            const { otp, newPassword } = req.body;

            if (!token) {
                throw new BadRequestError('Vui lòng gửi yêu cầu quên mật khẩu');
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            const findOTP = await modelOtp.findOne({
                where: { email: decode.email },
                order: [['createdAt', 'DESC']],
            });
            if (!findOTP) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // So sánh OTP
            const isMatch = await bcrypt.compare(otp, findOTP.otp);
            if (!isMatch) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Tìm người dùng
            const findUser = await modelUser.findOne({ where: { email: decode.email } });
            if (!findUser) {
                throw new AuthFailureError('Người dùng không tồn tại');
            }

            // Cập nhật mật khẩu mới
            findUser.password = hashedPassword;
            await findUser.save();

            // Xóa OTP sau khi đặt lại mật khẩu thành công
            await modelOtp.destroy({ where: { email: decode.email } });
            res.clearCookie('tokenResetPassword');
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng liên hệ ADMIN !!' });
        }
    }

    async getUsers(req, res) {
        const users = await modelUser.findAll();
        new OK({ message: 'Lấy danh sách người dùng thành công', metadata: users }).send(res);
    }

    async updateUser(req, res) {
        const { userId, fullName, phone, email, role } = req.body;

        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.fullName = fullName;
        user.phone = phone;
        user.email = email;
        user.role = role;
        await user.save();
        new OK({ message: 'Cập nhật người dùng thành công' }).send(res);
    }

    async changeAvatar(req, res) {
        const { file } = req;
        const { id } = req.user;
        if (!file) {
            throw new BadRequestError('Vui lòng chọn file');
        }
        const user = await modelUser.findOne({ where: { id } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.avatar = `uploads/avatars/${file.filename}`;
        await user.save();
        new OK({
            message: 'Upload thành công',
            metadata: `uploads/avatars/${file.filename}`,
        }).send(res);
    }

    async deleteUser(req, res) {
        const { userId } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await user.destroy();
        new OK({ message: 'Xóa người dùng thành công' }).send(res);
    }

    async updatePassword(req, res) {
        const { userId, password } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        user.password = passwordHash;
        await user.save();
        new OK({ message: 'Cập nhật mật khẩu thành công' }).send(res);
    }

    async createUser(req, res) {
        const { fullName, phone, email, password, role } = req.body;
        if (!fullName || !phone || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });

        if (findUser) {
            throw new BadRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        const dataUser = await modelUser.create({
            fullName,
            phone,
            email,
            password: passwordHash,
            typeLogin: 'email',
            role,
        });

        await dataUser.save();
        new OK({ message: 'Tạo người dùng thành công' }).send(res);
    }

    async getStatistic(req, res) {
        try {
            const { Op } = require('sequelize');
            const modelPayments = require('../models/payments.model');
            const modelProducts = require('../models/products.model');

            // 1. Thống kê tổng quan
            const totalCustomers = await modelUser.count();
            const totalOrders = await modelPayments.count();
            const totalRevenue = await modelPayments.sum('totalPrice', {
                where: { status: 'success' },
            });
            const totalProducts = await modelProducts.count();

            // Tính tỷ lệ tăng trưởng (so với tháng trước)
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

            // Tính số khách hàng tháng này và tháng trước
            const customersThisMonth = await modelUser.count({
                where: {
                    createdAt: {
                        [Op.gte]: firstDayOfMonth,
                    },
                },
            });
            const customersLastMonth = await modelUser.count({
                where: {
                    createdAt: {
                        [Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth],
                    },
                },
            });

            // Tính số đơn hàng tháng này và tháng trước
            const ordersThisMonth = await modelPayments.count({
                where: {
                    createdAt: {
                        [Op.gte]: firstDayOfMonth,
                    },
                },
            });
            const ordersLastMonth = await modelPayments.count({
                where: {
                    createdAt: {
                        [Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth],
                    },
                },
            });

            // Tính doanh thu tháng này và tháng trước
            const revenueThisMonth =
                (await modelPayments.sum('totalPrice', {
                    where: {
                        status: 'success',
                        createdAt: {
                            [Op.gte]: firstDayOfMonth,
                        },
                    },
                })) || 0;
            const revenueLastMonth =
                (await modelPayments.sum('totalPrice', {
                    where: {
                        status: 'success',
                        createdAt: {
                            [Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth],
                        },
                    },
                })) || 0;

            // Tính số sản phẩm tháng này và tháng trước
            const productsThisMonth = await modelProducts.count({
                where: {
                    createdAt: {
                        [Op.gte]: firstDayOfMonth,
                    },
                },
            });
            const productsLastMonth = await modelProducts.count({
                where: {
                    createdAt: {
                        [Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth],
                    },
                },
            });

            // Tính tỷ lệ tăng trưởng
            const customerGrowth =
                customersLastMonth === 0 ? 100 : ((customersThisMonth - customersLastMonth) / customersLastMonth) * 100;
            const orderGrowth =
                ordersLastMonth === 0 ? 100 : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;
            const revenueGrowth =
                revenueLastMonth === 0 ? 100 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
            const productGrowth =
                productsLastMonth === 0 ? 100 : ((productsThisMonth - productsLastMonth) / productsLastMonth) * 100;

            // 2. Thống kê doanh thu theo tháng
            const monthlyStats = await Promise.all(
                Array.from({ length: 12 }, async (_, index) => {
                    const month = index + 1;
                    const startDate = new Date(currentDate.getFullYear(), month - 1, 1);
                    const endDate = new Date(currentDate.getFullYear(), month, 0);

                    const revenue =
                        (await modelPayments.sum('totalPrice', {
                            where: {
                                status: 'success',
                                createdAt: {
                                    [Op.between]: [startDate, endDate],
                                },
                            },
                        })) || 0;

                    // Giả định lợi nhuận là 60% doanh thu
                    const profit = revenue * 0.6;

                    const orders = await modelPayments.count({
                        where: {
                            createdAt: {
                                [Op.between]: [startDate, endDate],
                            },
                        },
                    });

                    return {
                        month: `T${month}`,
                        revenue: Math.round(revenue / 1000000), // Chuyển đổi sang triệu
                        profit: Math.round(profit / 1000000), // Chuyển đổi sang triệu
                        orders,
                    };
                }),
            );

            // 3. Top sản phẩm bán chạy
            const topProducts = await modelPayments.findAll({
                attributes: [
                    'productId',
                    [connect.fn('COUNT', connect.col('productId')), 'soldCount'],
                    [connect.fn('SUM', connect.col('quantity')), 'totalQuantity'],
                ],
                where: { status: 'success' },
                group: ['productId'],
                order: [[connect.literal('totalQuantity'), 'DESC']],
                limit: 4,
                include: [
                    {
                        model: modelProducts,
                        as: 'product',
                        attributes: ['nameProduct'],
                        required: true,
                    },
                ],
            });

            // 4. Đơn hàng gần đây
            const recentOrders = await modelPayments.findAll({
                attributes: ['id', 'fullName', 'totalPrice', 'status', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 4,
                include: [
                    {
                        model: modelProducts,
                        as: 'product',
                        attributes: ['nameProduct'],
                        required: true,
                    },
                ],
            });

            new OK({
                message: 'Lấy thống kê thành công',
                metadata: {
                    stats: {
                        customers: {
                            count: totalCustomers,
                            growth: parseFloat(customerGrowth.toFixed(2)),
                            isPositive: customerGrowth > 0,
                        },
                        orders: {
                            count: totalOrders,
                            growth: parseFloat(orderGrowth.toFixed(2)),
                            isPositive: orderGrowth > 0,
                        },
                        revenue: {
                            count: totalRevenue,
                            growth: parseFloat(revenueGrowth.toFixed(2)),
                            isPositive: revenueGrowth > 0,
                        },
                        products: {
                            count: totalProducts,
                            growth: parseFloat(productGrowth.toFixed(2)),
                            isPositive: productGrowth > 0,
                        },
                    },
                    monthlyData: monthlyStats,
                    topProducts: topProducts.map((product) => ({
                        name: product.product.nameProduct,
                        value: Math.round(
                            (product.get('totalQuantity') /
                                topProducts.reduce((sum, p) => sum + parseInt(p.get('totalQuantity')), 0)) *
                                100,
                        ),
                    })),
                    recentOrders: recentOrders.map((order) => ({
                        id: order.id,
                        customer: order.fullName,
                        product: order.product.nameProduct,
                        amount: order.totalPrice,
                        status:
                            order.status === 'success'
                                ? 'Hoàn thành'
                                : order.status === 'shipping'
                                ? 'Đang giao'
                                : order.status === 'confirm'
                                ? 'Đang xử lý'
                                : 'Chờ xử lý',
                        avatar: order.fullName
                            .split(' ')
                            .map((name) => name[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase(),
                    })),
                },
            }).send(res);
        } catch (error) {
            console.error('Error in getStatistic:', error);
            throw new BadRequestError('Có lỗi xảy ra khi lấy thống kê');
        }
    }
}

module.exports = new controllerUser();
