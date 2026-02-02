export interface Friend {
  id: string;
  name: string;
  initials: string;
  isAdmin?: boolean;
  password?: string; // If set, requires password to access profile
  email?: string; // Google account email for automatic profile linking
}

// Add or remove friends here
// Email is required for Google OAuth login - only whitelisted emails can access the app
export const friends: Friend[] = [
  { id: "sam-d", name: "Sam D", initials: "SD", email: "sam.demetriou@gmail.com" },
  { id: "julian-z", name: "Julian Z", initials: "JZ", email: "" }, // TODO: Add email
  { id: "michael-v", name: "Michael V", initials: "MV", isAdmin: true, email: "michaelvergotis@gmail.com" },
  { id: "nick-c", name: "Nick Condo", initials: "NC", email: "" }, // TODO: Add email
];

// Get friend by email (for auto-login)
export function getFriendByEmail(email: string): Friend | undefined {
  return friends.find((f) => f.email?.toLowerCase() === email.toLowerCase());
}

// Check if email is whitelisted
export function isEmailWhitelisted(email: string): boolean {
  return friends.some((f) => f.email?.toLowerCase() === email.toLowerCase());
}

export function getFriendById(id: string): Friend | undefined {
  return friends.find((f) => f.id === id);
}
