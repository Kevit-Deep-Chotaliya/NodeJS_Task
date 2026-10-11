module.exports = function requestLogger(req, res, next) {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const role = req.userData?.role || 'guest';

        console.log(
            `${req.method} ${req.originalUrl} ` +
            `${res.statusCode} ${duration}ms ${role}`
        );
    });

    next();
};