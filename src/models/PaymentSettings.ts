export interface IPaymentSettings {
  id?: string;
  instaPayNumber: string;
  mobileWalletNumber: string;
  bankAccountDetails: string;
  isActive: boolean;
  adminWhatsAppNumber?: string;
  whatsAppNotificationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
