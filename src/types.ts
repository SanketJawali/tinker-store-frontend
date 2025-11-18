export interface Item {
  imgSrc: string,
  title: string,
  price: number,
  description: string
}

export interface ProductAPI {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url: string; // API field
  price: number;
  stock: number;
  owner_id: number;
}
