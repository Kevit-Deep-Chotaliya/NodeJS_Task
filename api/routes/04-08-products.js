const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Product = require('../models/04-product');
const checkAuth = require('../middleware/02-check-auth');
const checkRole = require('../middleware/02-check-role');
const upload = require('../middleware/08-upload-image');

const router = express.Router();


function validateProductFields(body, options = {}) {
    const errors = [];
    const partial = options.partial === true;

    if (!partial || Object.hasOwn(body, "name")) {
        if (
            typeof body.name !== "string" ||
            !body.name.trim()
        ) {
            errors.push("Product name is required.");
        }
    }

    if (!partial || Object.hasOwn(body, "category")) {
        if (
            typeof body.category !== "string" ||
            !body.category.trim()
        ) {
            errors.push("Product category is required.");
        }
    }

    if (Object.hasOwn(body, "price") || !partial) {
        if (
            body.price === undefined ||
            body.price === null ||
            body.price === "" ||
            !Number.isFinite(Number(body.price)) ||
            Number(body.price) <= 0
        ) {
            errors.push("Price must be a positive number.");
        }
    }

    if (
        Object.hasOwn(body, "instock") &&
        typeof body.instock !== "boolean"
    ) {
        errors.push("instock must be true or false.");
    }

    const allowedFields = ["name", "category", "price", "instock"];

    if (Object.keys(body).some(field => !allowedFields.includes(field))) {
        errors.push("One or more fields are not allowed.");
    }

    if (partial && Object.keys(body).length === 0) {
        errors.push("Provide at least one field to update.");
    }

    return errors;
}



// TASK 4: Create product — admin only

router.post(
    '/',
    checkAuth,
    checkRole('admin'),
    async (req, res, next) => {
        try {
            const errors = validateProductFields(
                req.body || {}
            );

            if (errors.length) {
                return res.status(400).json({
                    message: 'Invalid product input.',
                    errors
                });
            }

            const product = await Product.create({
                name: req.body.name.trim(),
                category: req.body.category.trim(),
                price: req.body.price,

                instock: Object.hasOwn(
                    req.body,
                    'instock'
                )
                    ? req.body.instock
                    : true
            });

            return res.status(201).json({
                message: 'Product created successfully.',
                product
            });

        } catch (error) {
            if (
                error.name === 'ValidationError' ||
                error.name === 'CastError'
            ) {
                return res.status(400).json({
                    message: error.message
                });
            }

            next(error);
        }
    }
);


// TASK 5: Get all products

router.get(
    '/',
    checkAuth,
    async (req, res, next) => {
        try {
            const page = req.query.page === undefined
                ? 1
                : Number(req.query.page);

            const limit = req.query.limit === undefined
                ? 10
                : Number(req.query.limit);

            if (
                !Number.isInteger(page) ||
                page < 1
            ) {
                return res.status(400).json({
                    message: 'page must be a positive integer.'
                });
            }

            if (
                !Number.isInteger(limit) ||
                limit < 1 ||
                limit > 100
            ) {
                return res.status(400).json({
                    message: 'limit must be an integer from 1 to 100.'
                });
            }

            const filter = {};

            if (req.query.category !== undefined) {
                if (
                    typeof req.query.category !== 'string' ||
                    !req.query.category.trim()
                ) {
                    return res.status(400).json({
                        message: 'category must be a non-empty string.'
                    });
                }

                filter.category = req.query.category.trim();
            }

            const [products, total] = await Promise.all([
                Product.find(filter)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),

                Product.countDocuments(filter)
            ]);

            return res.status(200).json({
                total,
                page,
                limit,
                count: products.length,
                products
            });

        } catch (error) {
            next(error);
        }
    }
);

// TASK 5: Get a single product

router.get(
    '/:id',
    checkAuth,
    async (req, res, next) => {
        try {
            if (
                !mongoose.isValidObjectId(req.params.id)
            ) {
                return res.status(400).json({
                    message: 'Invalid product id.'
                });
            }

            const product = await Product.findById(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

            return res.status(200).json({
                product
            });

        } catch (error) {
            next(error);
        }
    }
);

// TASK 6: Update product — admin only

router.patch(
    '/:id',
    checkAuth,
    checkRole('admin'),
    async (req, res, next) => {
        try {
            if (
                !mongoose.isValidObjectId(req.params.id)
            ) {
                return res.status(400).json({
                    message: 'Invalid product id.'
                });
            }

            const errors = validateProductFields(
                req.body || {},
                { partial: true }
            );

            if (errors.length) {
                return res.status(400).json({
                    message: 'Invalid product input.',
                    errors
                });
            }

            const updates = { ...req.body };

            if (Object.hasOwn(updates, 'name')) {
                updates.name = updates.name.trim();
            }

            if (Object.hasOwn(updates, 'category')) {
                updates.category = updates.category.trim();
            }

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { $set: updates },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

            return res.status(200).json({
                message: 'Product updated successfully.',
                product
            });

        } catch (error) {
            if (
                error.name === 'ValidationError' ||
                error.name === 'CastError'
            ) {
                return res.status(400).json({
                    message: error.message
                });
            }

            next(error);
        }
    }
);

// TASK 6: Delete product — admin only

router.delete(
    '/:id',
    checkAuth,
    checkRole('admin'),
    async (req, res, next) => {
        try {
            if (
                !mongoose.isValidObjectId(req.params.id)
            ) {
                return res.status(400).json({
                    message: 'Invalid product id.'
                });
            }

            const product = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

            return res.status(200).json({
                message: 'Product deleted successfully.',
                productId: product._id
            });

        } catch (error) {
            next(error);
        }
    }
);


// TASK 8: Upload product image — admin only

router.post(
    '/:id/image',
    checkAuth,
    checkRole('admin'),
    async (req, res, next) => {
        try {
            if (
                !mongoose.isValidObjectId(req.params.id)
            ) {
                return res.status(400).json({
                    message: 'Invalid product id.'
                });
            }

            const existing = await Product.findById(
                req.params.id
            );

            if (!existing) {
                return res.status(404).json({
                    message: 'Product not found.'
                });
            }

            upload.single('image')(
                req,
                res,
                async (error) => {
                    if (error) {
                        return next(error);
                    }

                    if (!req.file) {
                        return res.status(400).json({
                            message:
                                'An image file is required in the "image" field.'
                        });
                    }

                    try {
                        const product = await Product.findById(
                            req.params.id
                        );

                        if (!product) {
                            await fs.unlink(
                                req.file.path
                            ).catch(() => {});

                            return res.status(404).json({
                                message: 'Product not found.'
                            });
                        }

                        const oldPath = product.imagePath;

                        product.imagePath =
                            `/uploads/${req.file.filename}`;

                        await product.save();

                        // Remove the previous image after replacement.
                        if (
                            oldPath &&
                            oldPath.startsWith('/uploads/')
                        ) {
                            await fs.unlink(
                                path.join(
                                    __dirname,
                                    '../../',
                                    oldPath
                                )
                            ).catch(() => {});
                        }

                        return res.status(200).json({
                            message:
                                'Product image uploaded successfully.',
                            product
                        });

                    } catch (saveError) {
                        await fs.unlink(
                            req.file.path
                        ).catch(() => {});

                        return next(saveError);
                    }
                }
            );

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;

