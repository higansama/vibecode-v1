import type { Product, VariantProductStock, CreateProductDTO } from "./product.entity";

export interface IProductRepository {
  create(data: CreateProductDTO): Promise<Product & { variants: VariantProductStock[] }>;
  findAll(): Promise<Array<Product & { variants: VariantProductStock[] }>>;
  findById(id: number): Promise<(Product & { variants: VariantProductStock[] }) | null>;
  delete(id: number): Promise<void>;
}
