//app/(panel)/direct/list.tsx

import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type LastSeenMap = Record<string, number>;

export default function DirectListPage() {
  const feed = useFeed();
  const { currentUser, getThreadsForUser, messages, threads } = feed;

  // users pode não estar tipado no seu contexto, por isso acessamos via as any
  const users = (feed as any).users ?? [];

  const userId = currentUser?.id ?? '';

  console.log('USER ID:', userId);
  console.log('THREADS:', threads);
  console.log('ITEMS:', getThreadsForUser(userId));

  const items = useMemo(
    () => (userId ? getThreadsForUser(userId) : []),
    [userId, getThreadsForUser]
  );

  const [lastSeenMap, setLastSeenMap] = useState<LastSeenMap>({});

  // Carrega lastSeenAt de cada thread para o usuário atual
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId || items.length === 0) {
        setLastSeenMap({});
        return;
      }
      try {
        const keys = items.map(
          (t: any) => `@cj:lastSeen:thread:${userId}:${t.id}`
        );
        const pairs = await AsyncStorage.multiGet(keys);
        if (cancelled) return;
        const map: LastSeenMap = {};
        pairs.forEach(([key, value]) => {
          if (!key) return;
          // extrai threadId do key
          const parts = key.split(':');
          const threadId = parts[parts.length - 1];
          const ts = value ? Number(value) : 0;
          map[threadId] = Number.isFinite(ts) ? ts : 0;
        });
        setLastSeenMap(map);
      } catch (e) {
        // se der erro, segue sem unread (map vazio)
        setLastSeenMap({});
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, items]);

  const unreadFor = (threadId: string) => {
    const last = lastSeenMap[threadId] ?? 0;
    return messages.filter(
      (m: any) =>
        m.threadId === threadId &&
        m.senderId !== userId &&
        new Date(m.createdAt).getTime() > last
    ).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.logoText}>Suas conversas</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }: any) => {
          const otherId = item.userA === userId ? item.userB : item.userA;
          const otherUser =
            users.find((u: any) => u.id === otherId) ?? null;

          const displayName =
            (otherUser && (otherUser.name || otherUser.username)) ||
            `@${otherId}`;
          const avatarUri = otherUser?.avatarUri ?? null;

          const unreadCount = unreadFor(item.id);

          return (
            <Link
              href={{ pathname: '/(panel)/direct/[id]', params: { id: item.id } }}
              asChild
            >
              <Pressable style={styles.card}>
                <View style={styles.avatarWrapper}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons
                        name="person"
                        size={20}
                        color={colors.darkGreen}
                      />
                    </View>
                  )}
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{displayName}</Text>
                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.lastMessage ?? 'Comece a conversa…'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#999" />
              </Pressable>
            </Link>
          );
        }}
        ListEmptyComponent={
  <View
    style={{
      padding: 24,
      alignItems: 'center',
    }}
  >
    <Ionicons
      name="chatbubbles-outline"
      size={48}
      color="#B0BEC5"
    />

    <Text
      style={{
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
      }}
    >
      Nenhuma conversa iniciada
    </Text>

    <Text
      style={{
        color: '#D7E3DA',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
      }}
    >
      Quando uma solicitação de troca for enviada ou recebida,
      as conversas entre os usuários aparecerão aqui.
    </Text>
  </View>
}
      />
    </View>
  );
}

const AVATAR = 40;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkGreen, paddingTop: 34 },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 8,
    borderRadius: 8,
  },
  logoText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarWrapper: { width: AVATAR, height: AVATAR },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },
  avatarFallback: {
    backgroundColor: '#e8f0ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.darkGreen, fontWeight: '700' },
  lastMsg: { color: '#555', fontSize: 12, marginTop: 2 },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});