const jwt = require('jsonwebtoken');
const User = require('../models/01-user');

module.exports = async function checkAuth(req, res, next) {
    const header = req.get('Authorization');

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authentication required.'
        });
    }

    const token = header.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required.'
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        const user = await User.findById(decoded.userId)
            .select('_id role');

        if (!user || user.role !== decoded.role) {
            return res.status(401).json({
                message: 'Invalid or expired token.'
            });
        }

        req.userData = {
            userId: user._id.toString(),
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};