const redis = require('redis');
const { promisify } = require('util');

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on('connect', () => {
        console.log('Connected to Redis...');
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    await redisClient.connect();
})();

const hsetAsync = promisify(redisClient.hset).bind(redisClient);
const hgetAsync = promisify(redisClient.hget).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

const EMAIL_VERIFICATION_EXPIRATION = 10 * 60; // 10 minutes
const REFRESH_TOKEN_EXPIRATION = 3 * 24 * 60 * 60; // 3 days

async function storeEmailVerification(email, verificationCode) {
    try {
        const emailKey = `email:${email}`;
        await hsetAsync(emailKey, 'verification_code', verificationCode);
        await expireAsync(emailKey, EMAIL_VERIFICATION_EXPIRATION);
    } catch (error) {
        throw error;
    }
}

async function getEmailVerificationCode(email) {
    try {
        const emailKey = `email:${email}`;
        const verificationCode = await hgetAsync(emailKey, 'verification_code');
        return verificationCode;
    } catch (error) {
        throw error;
    }
}

async function storeRefreshToken(userId, refreshToken) {
    try {
        const userKey = `user:${userId}`;
        await hsetAsync(userKey, 'refresh_token', refreshToken);
        await expireAsync(userKey, REFRESH_TOKEN_EXPIRATION);
    } catch (error) {
        throw error;
    }
}

async function getRefreshToken(userId) {
    try {
        const userKey = `user:${userId}`;
        const refreshToken = await hgetAsync(userKey, 'refresh_token');
        return refreshToken;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    redisClient,
    storeEmailVerification,
    getEmailVerificationCode,
    storeRefreshToken,
    getRefreshToken,
};
