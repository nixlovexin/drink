export interface MenuItem {
  id: number;
  name: string;
  category: string;
  priceM: number;
  priceL: number;
}

export interface Topping {
  name: string;
}

export interface CartItem {
  cartId: string;
  id: number;
  name: string;
  userName: string;
  size: string;
  sugar: string;
  ice: string;
  toppings: string[];
  price: number;
  createdAt: number;
}

export interface GroupedItem {
  name: string;
  details: string;
  count: number;
  subtotal: number;
  users: string[];
}