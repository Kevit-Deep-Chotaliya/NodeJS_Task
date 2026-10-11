
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.resolve(__dirname, "../../uploads");

// Create the uploads folder automatically if it doesn't exist
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("ONLY_JPEG_PNG"));
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});
