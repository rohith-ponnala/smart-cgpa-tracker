const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);

const hashedPassword = await bcrypt.hash(password, salt);

const user = await User.create({
  name,
  email,
  password: hashedPassword,
});

    // generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });

    // user not found
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    // wrong password
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};