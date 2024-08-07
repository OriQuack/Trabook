const jwt = require('jsonwebtoken');
const User = require('../models/user');
const token = require('../util/token');

const authenticate = async (req, res, next) => {
    const accessToken = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    const refreshToken = req.cookies['refreshToken'];

    if (!accessToken || !refreshToken) {
        return res.status(403).json({ message: 'Authentication required: no AT or RT' });
    }

    try {
        const accessDecoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            {
                complete: true,
                algorithms: ['HS256'],
                clockTolerance: 0,
                ignoreExpiration: false,
                ignoreNotBefore: false,
            }
        );

        const user = await User.getUserByEmail(accessDecoded.payload.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = new User(user);
        return next();
    } catch (err) {
        // AT invalid or expired
        try {
            const accessDecoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    complete: true,
                    algorithms: ['HS256'],
                    clockTolerance: 0,
                    ignoreExpiration: true,
                    ignoreNotBefore: false,
                }
            );

            try {
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        complete: true,
                        algorithms: ['HS256'],
                        clockTolerance: 0,
                        ignoreExpiration: false,
                        ignoreNotBefore: false,
                    },
                    async (err, refreshDecoded) => {
                        if (err) {
                            return res.status(403).json({
                                message: 'Authentication required: AT expired and RT invalid or expired',
                            });
                        }

                        // AT expired && RT valid -> AT 재발급
                        const newAccessToken = token.genAccessToken(accessDecoded.payload.email);
                        return res
                            .status(403)
                            .cookie('refreshToken', refreshToken, {
                                expires: new Date(Date.now() + 259200000),
                                httpOnly: true,
                            })
                            .header('Authorization', newAccessToken)
                            .json({ message: 'Renewed expired access token' });
                    }
                );
            } catch (err) {
                return res.status(403).json({
                    message: 'Authentication required: AT expired and RT invalid or expired',
                });
            }
        } catch (err) {
            return res.status(403).json({ message: 'Authentication required: AT invalid' });
        }
    }
};

module.exports = authenticate;
