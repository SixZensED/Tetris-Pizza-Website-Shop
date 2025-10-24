export interface Category {
  category_id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  category_id: number;
  category_name: string;
  category_image: string;
  created_at?: string;
  updated_at?: string;
}
