export type ID = string;

export type User = {
  id: ID;
  name: string;
  email?: string;     // demo local
  password?: string;  // demo local (não use em produção)
  avatarUri?: string;
  bio?: string;
};

export type Plant = {
  id: ID;
  ownerId: ID;
  name: string;
  type: string;
  origin: string;
  family: string;
  description?: string;
  imageUri?: string;
  createdAt: string; // ISO
};

export type Post = {
  id: ID;
  ownerId: ID;
  plantId: ID;
  imageUri?: string;
  caption?: string;
  createdAt: string; // ISO
};

export type Comment = {
  id: ID;
  postId: ID;
  userId: ID;
  text: string;
  createdAt: string; // ISO
};

export type Rating = {
  id: ID;
  targetUserId: ID;
  raterUserId: ID;
  score: number; // 1-5
  comment?: string;
  createdAt: string; // ISO
};

export type Follow = {
  followerId: ID;
  followingId: ID;
};

export type Thread = {
  id: ID;      // determinístico: t-userA-userB (ordem alfabética)
  userA: ID;   // menor ID (alfabética)
  userB: ID;   // maior ID
  updatedAt: string;
  lastMessage?: string;
  lastSenderId?: ID;
};

export type Message = {
  id: ID;
  threadId: ID;
  senderId: ID;
  text: string;
  createdAt: string;
};

