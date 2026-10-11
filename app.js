const express = require('express');
const path = require('path');

const authRoutes = require('./api/routes/01-auth');
const userRoutes = require('./api/routes/03-users');
const productRoutes = require('./api/routes/04-08-products');

const requestLogger = require(
    './api/middleware/07-request-logger'
);

const app = express();

app.use(express.json());

// Task 7: register the logger before the routes.
app.use(requestLogger);

// Task 8: serve uploaded images.
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

// Task 1
app.use('/login', authRoutes);

// Task 3
app.use('/users', userRoutes);

// Tasks 4, 5, 6 and 8
app.use('/products', productRoutes);

// Undefined routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found.'
    });
});

// Multer and general error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Image must be 2 MB or smaller.'
            });
        }

        return res.status(400).json({
            message: err.message
        });
    }

    if (err.message === 'ONLY_JPEG_PNG') {
        return res.status(400).json({
            message: 'Only JPEG or PNG images are allowed.'
        });
    }

    console.error(err);

    return res.status(500).json({
        message: 'Internal server error.'
    });
});

module.exports = app;