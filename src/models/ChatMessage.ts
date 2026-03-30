export interface IChatMessage {
  id?: string;
  conversationId: string; // user's ID — the "room"
  orderId?: string;       // optional: linked order context
  sender: string;         // user ID sending the message
  role: "user" | "admin";
  text: string;
  createdAt?: string;
  updatedAt?: string;
}
