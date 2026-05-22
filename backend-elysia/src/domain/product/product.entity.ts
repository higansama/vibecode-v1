export interface Product {
  id: number;
  sku: string;
  nama_produk: string;
  createdAt: Date | null;
}

export interface VariantProductStock {
  id: number;
  id_product: number;
  sku_variant: string;
  stock_product: number;
  price: number;
  createdAt: Date | null;
}

export interface CreateProductDTO {
  sku: string;
  nama_produk: string;
  variants: CreateVariantDTO[];
}

export interface CreateVariantDTO {
  sku_variant: string;
  stock_product: number;
  price: number;
}
