export interface IOrderItem {
  product: string; // ID of the product
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface IOrder {
  id?: string;
  user: string; // ID of the user
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
