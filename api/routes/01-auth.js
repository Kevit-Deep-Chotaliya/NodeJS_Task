const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/01-user');

const router = express.Router();

// POST /login
router.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(401).json({
                message: 'Email or password is incorrect.'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select('+password');

        if (
            !user ||
            !(await bcrypt.compare(password, user.password))
        ) {
            return res.status(401).json({
                message: 'Email or password is incorrect.'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;