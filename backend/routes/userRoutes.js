const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validator');

router.post('/', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
