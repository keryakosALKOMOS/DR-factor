export interface User {
  id?: string; // FireStore ID mapping
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  fcmTokens?: string[];
  createdAt: string; // Stored as ISO string
  updatedAt: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  parent?: string | null; // Category ID
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string; // Category ID
  subCategory?: string; // SubCategory ID
  images: string[];
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id?: string;
  user: string; // User ID
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomDesignOrder {
  id?: string;
  user: string; // User ID
  description: string;
  uploadedLogoUrl?: string;
  uploadedDesignUrl?: string;
  quantity?: number;
  colors?: string[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  totalPrice: number;
  status: "Pending" | "Pending Review" | "Confirmed" | "Manufacturing" | "Delivered" | "Rejected";
  estimatedCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: string;
  conversationId: string; // User ID (room)
  orderId?: string; // Optional: linked order context
  sender: {
    id: string; // Sender ID
    name: string; // Sender Name cached for easy display
  };
  role: "user" | "admin";
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSettings {
  id?: string;
  instaPayNumber: string;
  mobileWalletNumber: string;
  bankAccountDetails: string;
  isActive: boolean;
  adminWhatsAppNumber?: string;
  whatsAppNotificationsEnabled?: boolean;
}
