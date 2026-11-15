// context/FeedContext.tsx
import {
  Comment,
  Follow,
  ID,
  Message,
  Plant,
  Post,
  Rating,
  Thread,
  User,
} from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';



type FeedContextType = {
  // Estado principal
  currentUser: User;
  users: User[]; // << NOVO
  plants: Plant[];
  posts: Post[];
  comments: Comment[];
  ratings: Rating[];
  follows: Follow[];
  threads: Thread[];
  messages: Message[];

  // CRUD
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt' | 'ownerId'>, createPost?: boolean) => Promise<Plant>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'ownerId'>) => Promise<Post>;
  addComment: (input: { postId: ID; text: string }) => Promise<Comment>;
  addRating: (input: { targetUserId: ID; score: number; comment?: string }) => Promise<Rating>;

  // Perfil e relações
  updateCurrentUser: (input: Partial<User>) => Promise<void>;
  deletePost: (postId: ID) => Promise<void>;
  deletePlant: (plantId: ID) => Promise<void>;
  followUser: (targetUserId: ID) => Promise<void>;
  unfollowUser: (targetUserId: ID) => Promise<void>;

  // Helpers de métricas e usuários
  getUserAverageRating: (targetUserId: ID) => number;
  getCountsForUser: (userId: ID) => { posts: number; followers: number; following: number };
  getUserPosts: (userId: ID) => Post[];
  getUserById: (id: ID) => User | undefined; // << NOVO

  // Direct (mensagens)
  getThreadsForUser: (userId: ID) => Thread[];
  getOrCreateThreadWith: (otherUserId: ID) => Thread;
  sendMessage: (threadId: ID, text: string) => Promise<Message>;
};

const FeedContext = createContext<FeedContextType | null>(null);

const STORAGE_KEYS = {
  currentUser: '@cj:currentUser',
  users: '@cj:users',    // << NOVO
  plants: '@cj:plants',
  posts: '@cj:posts',
  comments: '@cj:comments',
  ratings: '@cj:ratings',
  follows: '@cj:follows',
  threads: '@cj:threads',
  messages: '@cj:messages',
};

// Usuário logado mock (se não houver no storage)
const MOCK_USER: User = {
  id: 'user-1',
  name: 'Você',
};

// Usuários “outros” para demo local
const OTHER_USERS: User[] = [
  { id: 'user-2', name: 'Ana Jardim' },
  { id: 'user-3', name: 'Pedro Verde' },
  { id: 'user-4', name: 'Flora Luz'  },
];

function uuid() {
  return Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

/** Cria um ID determinístico para uma thread entre 2 usuários (ordem independente). */
function makeThreadId(a: ID, b: ID) {
  const [x, y] = [a, b].sort();
  return `t-${x}-${y}`; 
}

export const FeedProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Estados principais
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [users, setUsers] = useState<User[]>([]);           // << NOVO
  const [plants, setPlants] = useState<Plant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
const [threads, setThreads] = useState<Thread[]>([
  {
    id: 't-1-user-2',
    userA: '1',
    userB: 'user-2',
    updatedAt: new Date().toISOString(),
    lastMessage: 'Tenho interesse na Lavanda.',
    lastSenderId: 'user-2',
  },
]);

const [messages, setMessages] = useState<Message[]>([
  {
    id: 'm1',
    threadId: 't-1-user-2',
    userB: 'user-2',
    text: 'Olá! A Lavanda ainda está disponível?',
    createdAt: '2026-09-01T10:00:00',
  },
  {
    id: 'm2',
    threadId: 't-1-user-2',
    senderId: '1',
    text: 'Sim, continua disponível.',
    createdAt: '2026-09-01T10:01:00',
  },
  {
    id: 'm3',
    threadId: 't-1-user-2',
    userB: 'user-2',
    text: 'Tenho interesse em trocar por Alecrim.',
    createdAt: '2026-09-01T10:02:00',
  },
  {
    id: 'm4',
    threadId: 't-1-user-2',
    senderId: '1',
    text: 'Perfeito! Podemos combinar a troca.',
    createdAt: '2026-09-01T10:03:00',
  },
]);

  // --- Carrega do AsyncStorage ao montar ---
  useEffect(() => {
    (async () => {

      await AsyncStorage.removeItem('@cj:plants');
      await AsyncStorage.removeItem('@cj:posts');
      await AsyncStorage.removeItem('@cj:threads');
      await AsyncStorage.removeItem('@cj:messages');

      try {
        const [
          uStr, usersStr, pStr, poStr, cStr, rStr, fStr, tStr, mStr,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.currentUser),
          AsyncStorage.getItem(STORAGE_KEYS.users),
          AsyncStorage.getItem(STORAGE_KEYS.plants),
          AsyncStorage.getItem(STORAGE_KEYS.posts),
          AsyncStorage.getItem(STORAGE_KEYS.comments),
          AsyncStorage.getItem(STORAGE_KEYS.ratings),
          AsyncStorage.getItem(STORAGE_KEYS.follows),
          AsyncStorage.getItem(STORAGE_KEYS.threads),
          AsyncStorage.getItem(STORAGE_KEYS.messages),
        ]);

        if (uStr) setCurrentUser(JSON.parse(uStr));

        if (usersStr) {
          const parsed = JSON.parse(usersStr) as User[];
          setUsers(parsed.length ? parsed : [MOCK_USER, ...OTHER_USERS]);
        } else {
          setUsers([MOCK_USER, ...OTHER_USERS]);
        }

        if (pStr) setPlants(JSON.parse(pStr));
        if (poStr) setPosts(JSON.parse(poStr));
        if (cStr) setComments(JSON.parse(cStr));
        if (rStr) setRatings(JSON.parse(rStr));
        if (fStr) setFollows(JSON.parse(fStr));
        if (tStr) setThreads(JSON.parse(tStr));
        if (mStr) setMessages(JSON.parse(mStr));
   } catch (e) {
        console.warn('Falha ao carregar storage', e);
      }
    })();
  }, []);

  // --- Persiste no AsyncStorage quando muda ---
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }, [users]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.plants, JSON.stringify(plants)); }, [plants]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts)); }, [posts]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments)); }, [comments]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings)); }, [ratings]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.follows, JSON.stringify(follows)); }, [follows]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads)); }, [threads]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages)); }, [messages]);

  // --- CRUD e helpers ---
  const addPlant: FeedContextType['addPlant'] = async (plantInput, createPost = true) => {
    const newPlant: Plant = {
      id: uuid(),
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      ...plantInput,
    };
    setPlants(prev => [newPlant, ...prev]);

    if (createPost) {
      const newPost: Post = {
        id: uuid(),
        ownerId: currentUser.id,
        plantId: newPlant.id,
        imageUri: newPlant.imageUri,
        caption: `Minha planta: ${newPlant.name}`,
        createdAt: new Date().toISOString(),
      };
      setPosts(prev => [newPost, ...prev]);
    }
    return newPlant;
  };

  const addPost: FeedContextType['addPost'] = async (postInput) => {
    const newPost: Post = {
      id: uuid(),
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      ...postInput,
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const addComment: FeedContextType['addComment'] = async ({ postId, text }) => {
    const newComment: Comment = {
      id: uuid(),
      postId,
      userId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    return newComment;
  };

  const addRating: FeedContextType['addRating'] = async ({ targetUserId, score, comment }) => {
    const newRating: Rating = {
      id: uuid(),
      targetUserId,
      raterUserId: currentUser.id,
      score,
      comment,
      createdAt: new Date().toISOString(),
    };
    setRatings(prev => [newRating, ...prev]);
    return newRating;
  };

  const updateCurrentUser: FeedContextType['updateCurrentUser'] = async (input) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...input };
      // também atualiza a lista de users
      setUsers(old => {
        const has = old.some(u => u.id === updated.id);
        if (has) return old.map(u => (u.id === updated.id ? { ...u, ...input } : u));
        return [updated, ...old];
      });
      return updated;
    });
  };

  const deletePost: FeedContextType['deletePost'] = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
  };

  const deletePlant: FeedContextType['deletePlant'] = async (plantId) => {
    setPlants(prev => prev.filter(pl => pl.id !== plantId));
    setPosts(prevPosts => {
      const removedPostIds = prevPosts.filter(p => p.plantId === plantId).map(p => p.id);
      const remaining = prevPosts.filter(p => p.plantId !== plantId);
      setComments(prevComments => prevComments.filter(c => !removedPostIds.includes(c.postId)));
      return remaining;
    });
  };

  const followUser: FeedContextType['followUser'] = async (targetUserId) => {
    if (targetUserId === currentUser.id) return;
    setFollows(prev => {
      const exists = prev.some(f => f.followerId === currentUser.id && f.followingId === targetUserId);
      if (exists) return prev;
      return [...prev, { followerId: currentUser.id, followingId: targetUserId }];
    });
  };

  const unfollowUser: FeedContextType['unfollowUser'] = async (targetUserId) => {
    setFollows(prev => prev.filter(f => !(f.followerId === currentUser.id && f.followingId === targetUserId)));
  };

  const getUserAverageRating = (targetUserId: ID) => {
    const r = ratings.filter(x => x.targetUserId === targetUserId);
    if (!r.length) return 0;
    return r.reduce((acc, cur) => acc + cur.score, 0) / r.length;
  };

  const getCountsForUser: FeedContextType['getCountsForUser'] = (userId) => {
    const postsCount = posts.filter(p => p.ownerId === userId).length;
    const followersCount = follows.filter(f => f.followingId === userId).length;
    const followingCount = follows.filter(f => f.followerId === userId).length;
    return { posts: postsCount, followers: followersCount, following: followingCount };
  };

  const getUserPosts: FeedContextType['getUserPosts'] = (userId) => {
    return posts
      .filter(p => p.ownerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // mais recentes primeiro
  };

  const getUserById: FeedContextType['getUserById'] = (id) => {
    return users.find(u => u.id === id);
  };

  // --- Direct: Threads & Messages ---
  const getThreadsForUser: FeedContextType['getThreadsForUser'] = (userId) => {
    return threads
      .filter(t => t.userA === userId || t.userB === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  };

  const getOrCreateThreadWith: FeedContextType['getOrCreateThreadWith'] = (otherUserId) => {
    const id = makeThreadId(currentUser.id, otherUserId);
    const found = threads.find(t => t.id === id);
    if (found) return found;

    const [a, b] = [currentUser.id, otherUserId].sort();
    const newThread: Thread = {
      id,
      userA: a,
      userB: b,
      updatedAt: new Date().toISOString(),
      lastMessage: undefined,
      lastSenderId: undefined,
    };
    setThreads(prev => [newThread, ...prev]);
    return newThread;
  };

  const sendMessage: FeedContextType['sendMessage'] = async (threadId, text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return Promise.reject(new Error('Mensagem vazia'));
    }
    const msg: Message = {
      id: uuid(),
      threadId,
      senderId: currentUser.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? { ...t, updatedAt: msg.createdAt, lastMessage: msg.text, lastSenderId: msg.senderId }
          : t
      )
    );
    return msg;
  };

  const value = useMemo<FeedContextType>(() => ({
    currentUser,
    users,
    plants,
    posts,
    comments,
    ratings,
    follows,
    threads,
    messages,

    addPlant,
    addPost,
    addComment,
    addRating,

    updateCurrentUser,
    deletePost,
    deletePlant,
    followUser,
    unfollowUser,

    getUserAverageRating,
    getCountsForUser,
    getUserPosts,
    getUserById,

    getThreadsForUser,
    getOrCreateThreadWith,
    sendMessage,
  }), [
    currentUser, users, plants, posts, comments, ratings, follows, threads, messages,
  ]);

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeed deve ser usado dentro de FeedProvider');
  return ctx;
};