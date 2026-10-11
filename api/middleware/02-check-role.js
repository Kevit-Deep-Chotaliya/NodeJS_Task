module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userData) {
            return res.status(401).json({
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.userData.role)) {
            return res.status(403).json({
                message: 'Access denied.You do not have permission to view this page.'
            });
        }

        next();
    };
};