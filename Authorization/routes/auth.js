const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImage');

const router = express.Router();

router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);
router.post('/send-verify-email', authController.postSendVerificationCode);
router.post('/verify-code', authController.postVerifyCode);
router.post('/update-profile', authenticate, uploadImage, authController.postUpdateProfile);
router.post('/update-password', authenticate, authController.postUpdatePassword);
router.delete('/signout', authenticate, authController.deleteUserData);
router.get('/renew-token', authenticate, authController.getNewAccessToken);
router.get('/fetch-user', authController.getUserData);
router.get('/fetch-users', authController.getUsersData);
router.post('/google-login', authController.postGoogleLogin);
router.post('/kakao-login', authController.postKakaoAuth);
router.post('/naver-login', authController.postNaverLogin);

router.post('/test-token', authController.postTestToken);

module.exports = router;
