const userModel = require("../models/userModel");
const { publicUser } = require("../views/userView");
const { signToken } = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/password");

// define a function to validate the input fields for registration and login
function validateAuthFields({ name, email, password }, requireName = false) {
  const errors = [];
  if (requireName && (!name || !String(name).trim()))
    errors.push("Name is required");
  if (!email || !String(email).trim()) errors.push("Email is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    errors.push("Email must be valid");
  }
  if (!password || String(password).length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  return errors;
}

// define the controller functions for registration, login, and getting the current user
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const errors = validateAuthFields(req.body, true);
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const user = await userModel.create({
      name,
      email,
      password: hashPassword(password),
    });

    const token = signToken({ sub: user.id, email: user.email });
    return res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = validateAuthFields(req.body);
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const user = await userModel.findByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ sub: user.id, email: user.email });
    return res.json({ user: publicUser(user), token });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me,
};
