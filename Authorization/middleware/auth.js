const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisUtil = require('../utils/redisUtil');

const authenticate = async (req, res, next) => {
    const userId = req.headers['userid'];
    const user = await User.getUserByUserId(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const refreshToken = await redisUtil.getRefreshToken(userId);
    console.log(refreshToken);
    console.log(refreshToken.split(':')[1]);
    if (!refreshToken) {
        return res.status(403).json({ message: 'RT invalid or expired1' });
    }

    return jwt.verify(
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
                return res.status(403).json({ message: 'RT invalid or expired2' });
            }
            req.user = new User(user);
            return next();
        }
    );
};

module.exports = authenticate;
