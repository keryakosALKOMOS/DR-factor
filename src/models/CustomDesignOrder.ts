export interface ICustomDesignOrder {
  id?: string;
  user: string; // ID of the user
  description: string;
  hexColors: string[];
  uploadedLogoUrl?: string;
  uploadedDesignUrl?: string;
  aiPreviewUrl?: string; // from "Nano Banana" or similar mock
  quantity: number;
  notes?: string;
  paymentMethod?: string;
  paymentProofUrl?: string;
  paymentStatus: "Pending" | "Paid";
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Rejected";
  createdAt?: string;
  updatedAt?: string;
}
