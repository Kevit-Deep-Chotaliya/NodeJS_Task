## Node.js Assessment

## Requirements
- Node.js
- MongoDB Community Server
- MongoDB Compass
- Postman

## Setup
1. Run `npm install`.
2. Create `.env` using the provided example.
3. Start MongoDB.
4. Run `npm run dev`.

## Initial admin setup
1. Generate a bcrypt password hash:
   `node -e "require('bcrypt').hash('Admin@123', 12).then(console.log)"`
2. Open MongoDB Compass and connect to the local database.
3. Create database `mean_nodejs_challenge`.
4. Create collection `users`.
5. Insert a document with `name`, `email`, the generated
   bcrypt `password` hash, and `role: "admin"`.
6. Log in using the corresponding email and original password.

## Authentication
Send protected requests with:
`Authorization: Bearer YOUR_JWT_TOKEN`

Access:
- user: GET products
- admin: create, update, delete products and upload images

## Product pagination
Example:
`GET /products?category=Electronics&page=1&limit=5`

## Image upload
Send a multipart/form-data request with the field name `image`.
Only JPEG and PNG images up to 2 MB are accepted.