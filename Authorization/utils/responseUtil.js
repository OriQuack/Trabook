exports.sendErrorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({ message });
};

exports.generateAuthResponse = (res, statusCode, accessToken, user) => {
    return res.status(statusCode).header('Authorization', accessToken).json(user);
};
