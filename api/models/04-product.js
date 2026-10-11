const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0.01, 'Price must be a positive number']
        },
        instock: {
            type: Boolean,
            default: true
        },
        imagePath: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);