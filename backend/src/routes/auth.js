const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Please provide email and password' }, meta: { requestId: req.requestId } });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'User already exists' }, meta: { requestId: req.requestId } });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      role: role || 'buyer'
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        token
      },
      meta: { requestId: req.requestId }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }, meta: { requestId: req.requestId } });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' }, meta: { requestId: req.requestId } });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        token
      },
      meta: { requestId: req.requestId }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
