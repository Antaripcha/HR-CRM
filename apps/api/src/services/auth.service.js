const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

class AuthService {
  async register(data) {
    const { name, email, password, role = 'employee' } = data;
    
    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });

    const user = await User.create({ name, email, password, role });

    // Create employee profile if role is employee or hr
    if (role !== 'admin') {
      await Employee.create({ user: user._id });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token) {
    if (!token) throw Object.assign(new Error('No refresh token'), { statusCode: 401 });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

module.exports = new AuthService();
