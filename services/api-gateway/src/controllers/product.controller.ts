import { Request, Response } from 'express';
import { ProductServiceClient } from 'shared/dist';

export class ProductController {
    private productService: ProductServiceClient;

    constructor() {
        this.productService = new ProductServiceClient();
    }

    async createProduct(req: Request, res: Response): Promise<void> {
        const { name, description, price, stock } = req.body;

        const newProduct = await this.productService.createProduct({
            name,
            description,
            price,
            stock,
        });
        res.status(201).json(newProduct);
    }

    async getProducts(req: Request, res: Response): Promise<void> {
        const products = await this.productService.getProducts(
            parseInt(req.query.page as string),
            parseInt(req.query.limit as string)
        );
        res.json(products);
    }

    async getProduct(req: Request, res: Response): Promise<void> {
        const productId = req.params.id;

        const product = await this.productService.getProduct(productId);
        res.json(product);
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        const productId = req.params.id;
        const { name, description, price, stock } = req.body;

        const updatedProduct = await this.productService.updateProduct(productId, {
            name,
            description,
            price,
            stock,
        });
        res.json(updatedProduct);
    }

    async updateStock(req: Request, res: Response): Promise<void> {
        const productId = req.params.id;
        const { quantity } = req.body;
        const updatedProduct = await this.productService.updateStock(productId, quantity);
        res.json(updatedProduct);
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        const productId = req.params.id;

        await this.productService.deleteProduct(productId);
        res.status(204).send();
    }



}