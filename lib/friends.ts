export interface Friend {
  id: string;
  name: string;
  initials: string;
  isAdmin?: boolean;
  password?: string; // If set, requires password to access profile
}

// Add or remove friends here
export const friends: Friend[] = [
  { id: "sam-d", name: "Sam D", initials: "SD" },
  { id: "julian-z", name: "Julian Z", initials: "JZ" },
  { id: "michael-v", name: "Michael V", initials: "MV", isAdmin: true, password: "admin123" },
  { id: "nick-c", name: "Nick Condo", initials: "NC" },
];

export function getFriendById(id: string): Friend | undefined {
  return friends.find((f) => f.id === id);
}
