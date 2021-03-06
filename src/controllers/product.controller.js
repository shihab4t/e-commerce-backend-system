const { response } = require("../utils/response");
const productService = require("./../services/product.service");
const redisService = require("./../services/redis.service");
const { authenticate, manager } = require("../middlewares/authorization");
const {
    ProductCreateSchema,
    ProductUpdateSchema,
    ProductCreateManySchema,
    ProductFilterSchema
} = require("../models/product.model");
const { validate } = require("../middlewares/validate");
const { cacheProduct } = require("../middlewares/cache");
const { set } = require("../services/utils.service");
const productRouter = require("express").Router();

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.saveOne(req.body);
        await redisService.set(product._id, product);
        return response(res, "Created product successfully", product, 201);
    } catch (err) {
        return next(err);
    }
};

const createProductMany = async (req, res, next) => {
    try {
        const products = await productService.saveMany(req.body);
        return response(
            res,
            `${products.length} products created`,
            products,
            201
        );
    } catch (err) {
        return next(err);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const sortby = set(req.query.sortby, "_id");
        const order = req.query.order === "desc" ? -1 : 1;
        const limit = set(req.query.limit, 30);
        const page = set(req.query.page, 1);

        const skip = (page - 1) * limit;
        const products = await productService.getMany(
            sortby,
            order,
            skip,
            limit
        );
        return response(
            res,
            `Total ${products.length} products by the query`,
            products
        );
    } catch (err) {
        return next(err);
    }
};

const filterProducts = async (req, res, next) => {
    try {
        const sortby = set(req.query.sortby, "_id");
        const order = req.query.order === "desc" ? -1 : 1;
        const limit = set(req.query.limit, 30);
        const page = set(req.query.page, 1);
        const skip = (page - 1) * limit;

        const filters = req.body;

        const args = {};

        if (filters.price)
            args.price = { $gte: filters.price.min, $lte: filters.price.max };
        if (filters.categories) args.categories = { $in: filters.categories };

        const products = await productService.filter(
            sortby,
            order,
            skip,
            limit,
            args
        );
        return response(
            res,
            `Total ${products.length} products by the filtering`,
            products
        );
    } catch (err) {
        return next(err);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const product = await productService.getOne(req.params.productId);
        console.log(product);
        await redisService.set(product._id, product);
        return response(res, "Get One product", product);
    } catch (err) {
        return next(err);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        await productService.getOne(productId);
        await productService.deleteOne(productId);
        await redisService.del(productId);
        return response(res, "Product deleted successfully");
    } catch (err) {
        return next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        await productService.getOne(productId);
        const updatedProduct = await productService.updateOne(
            productId,
            req.body
        );
        await redisService.set(updatedProduct._id, updatedProduct);
        return response(res, "Product updated", updatedProduct);
    } catch (err) {
        return next(err);
    }
};

productRouter
    .route("/many")
    .post(
        validate(ProductCreateManySchema),
        authenticate,
        manager,
        createProductMany
    );

productRouter
    .route("/filter")
    .post(validate(ProductFilterSchema), filterProducts);

productRouter
    .route("/")
    .post(validate(ProductCreateSchema), authenticate, manager, createProduct)
    .get(getProducts);

productRouter
    .route("/:productId")
    .get(cacheProduct, getProduct)
    .delete([authenticate], deleteProduct)
    .patch(
        [validate(ProductUpdateSchema), authenticate, manager],
        updateProduct
    );

module.exports = productRouter;
