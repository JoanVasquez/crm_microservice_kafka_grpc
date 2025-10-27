import { injectable } from "tsyringe";
import { ProductService } from "../service/product.service";

@injectable()
export class ProductController {
    constructor(private productService: ProductService) { }

    async GetProduct(call: any, callback: any): Promise<void> {
        try {
            const product = await this.productService.getProductById(call.request.id);
            if (!product) {
                return callback({
                    code: 5,
                    message: 'Product not found'
                });
            }

            const response = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: new Date(product.createdAt).toISOString(),
                updatedAt: new Date(product.updatedAt).toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async GetProducts(call: any, callback: any): Promise<void> {
        try {
            const page = call.request.page || 1;
            const limit = call.request.limit || 10;

            const { items, total } = await this.productService.getProducts(page, limit);

            const response = {
                products: items.map(product => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    createdAt: product.createdAt.toISOString(),
                    updatedAt: product.updatedAt.toISOString()
                })),
                total,
                page,
                limit
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async CreateProduct(call: any, callback: any): Promise<void> {
        try {
            const product = await this.productService.createProduct({
                name: call.request.name,
                description: call.request.description,
                price: call.request.price,
                stock: call.request.stock,
                category: call.request.category,
            });

            const response = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async UpdateProduct(call: any, callback: any): Promise<void> {
        try {
            const updatedProduct = await this.productService.updateProduct(call.request.id, {
                name: call.request.name,
                description: call.request.description,
                price: call.request.price,
                stock: call.request.stock,
                category: call.request.category
            });

            if (!updatedProduct) {
                return callback({
                    code: 5,
                    message: 'Product not found'
                });
            }

            const response = {
                id: updatedProduct.id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                stock: updatedProduct.stock,
                category: updatedProduct.category,
                createdAt: updatedProduct.createdAt.toISOString(),
                updatedAt: updatedProduct.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async UpdateStock(call: any, callback: any): Promise<void> {
        try {

            console.log(call.request.quantity)
            const updatedProduct = await this.productService.updateProduct(call.request.id, {
                stock: call.request.quantity
            });

            if (!updatedProduct) {
                return callback({
                    code: 5,
                    message: 'Product not found'
                });
            }

            const response = {
                id: updatedProduct.id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                stock: updatedProduct.stock,
                category: updatedProduct.category,
                createdAt: updatedProduct.createdAt.toISOString(),
                updatedAt: updatedProduct.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async DeleteProduct(call: any, callback: any): Promise<void> {
        try {
            const deleted = await this.productService.deleteProduct(call.request.id);
            if (!deleted) {
                return callback({
                    code: 5,
                    message: 'Product not found'
                });
            }

            callback(null, { success: true });
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }
}