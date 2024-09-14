const User = require('../models/user');

const authenticate = async (req, res, next) => {
    const userId = req.headers['userId'];

    if (!accessToken) {
        return res.status(403).json({ message: 'Authentication required: no access token' });
    }
    const user = await User.getUserByUserId(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    req.user = new User(user);
    return next();
};

module.exports = authenticate;
