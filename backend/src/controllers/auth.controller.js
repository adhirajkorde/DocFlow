const authService = require('../services/auth.service');
const { signToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const user = await authService.registerUser(email, password, name.trim());
    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me };
