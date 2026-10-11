const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/01-user');

const checkAuth = require('../middleware/02-check-auth');
const checkRole = require('../middleware/02-check-role');

const router = express.Router();

router.post(
    '/',
    checkAuth,
    checkRole('admin'),
    async (req, res, next) => {
        try {
            const { name, email, password } = req.body || {};

            if (typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({
                    message: 'Name is required.'
                });
            }

            if (typeof email !== 'string' || !email.trim()) {
                return res.status(400).json({
                    message: 'Email is required.'
                });
            }

            if (typeof password !== 'string' || !password) {
                return res.status(400).json({
                    message: 'Password is required.'
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const existing = await User.findOne({
                email: normalizedEmail
            });

            if (existing) {
                return res.status(409).json({
                    message: 'Email already exists.'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user'
            });

            return res.status(201).json({
                message: 'User created successfully.',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'Email already exists.'
                });
            }

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: Object.values(error.errors)
                        .map(item => item.message)
                        .join(' ')
                });
            }

            next(error);
        }
    }
);

module.exports = router;