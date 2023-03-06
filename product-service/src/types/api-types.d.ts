export type Product = {
    description: string;
    id: string;
    price: number;
    title: string;
}

export type Products = Product[];

export type Stock = {
    product_id: string;
    count: number;
};

export type Error = {
    message: string
}

export type ProductWithStock = Product & Omit<Stock, 'product_id'>;
export type ProductPostBody = Omit<ProductWithStock, 'id'>;