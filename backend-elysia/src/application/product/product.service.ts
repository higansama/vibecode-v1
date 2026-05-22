import type { IProductRepository } from "../../domain/product/product.repository.interface";
import type { CreateProductDTO } from "../../domain/product/product.entity";

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDTO) {
    if (!data.sku || !data.nama_produk) {
      throw new Error("SKU and nama_produk are required");
    }
    return this.productRepository.create(data);
  }

  async getAllProducts() {
    return this.productRepository.findAll();
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async deleteProduct(id: number) {
    await this.getProductById(id); // Ensure exists
    await this.productRepository.delete(id);
  }
}
