const redis = require('redis');

let redisClient;

(async () => {
    // Create the Redis client
    redisClient = redis.createClient();

    // Handle connection events
    redisClient.on('connect', () => {
        console.log('Connected to Redis...');
    });

    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    // Connect to Redis server
    await redisClient.connect();
})();

const EMAIL_VERIFICATION_EXPIRATION = 10 * 60; // 10 minutes
const REFRESH_TOKEN_EXPIRATION = 3 * 24 * 60 * 60; // 3 days

async function storeEmailVerification(email, verificationCode) {
    try {
        const emailKey = `email:${email}`;
        // Use hSet and expire methods directly
        await redisClient.hSet(emailKey, 'verification_code', verificationCode);
        await redisClient.expire(emailKey, EMAIL_VERIFICATION_EXPIRATION);
    } catch (error) {
        console.error('Error storing email verification:', error);
        throw error;
    }
}

async function getEmailVerificationCode(email) {
    try {
        const emailKey = `email:${email}`;
        // Use hGet method directly
        const verificationCode = await redisClient.hGet(emailKey, 'verification_code');
        return verificationCode;
    } catch (error) {
        console.error('Error getting email verification code:', error);
        throw error;
    }
}

async function storeRefreshToken(userId, refreshToken) {
    try {
        const userKey = `user:${userId}`;
        await redisClient.hSet(userKey, 'refresh_token', refreshToken);
        await redisClient.expire(userKey, REFRESH_TOKEN_EXPIRATION);
    } catch (error) {
        console.error('Error storing refresh token:', error);
        throw error;
    }
}

async function getRefreshToken(userId) {
    try {
        const userKey = `user:${userId}`;
        const refreshToken = await redisClient.hGet(userKey, 'refresh_token');
        return refreshToken;
    } catch (error) {
        console.error('Error getting refresh token:', error);
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
