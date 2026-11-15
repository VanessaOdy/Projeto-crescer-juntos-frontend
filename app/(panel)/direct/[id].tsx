//app/(panel)/direct/[id].tsx

import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function DirectChatPage() {
  const feed = useFeed();
  const { currentUser, threads, messages, sendMessage } = feed;
  const users = (feed as any).users ?? [];

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const threadId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const [text, setText] = useState('');
  const listRef = useRef<FlatList<any>>(null);

  const thread = useMemo(
    () => threads.find((t: any) => t.id === threadId),
    [threads, threadId]
  );

  const threadMessages = useMemo(
    () =>
      messages
        .filter((m: any) => m.threadId === threadId)
        .sort((a: any, b: any) =>
          String(a.createdAt).localeCompare(String(b.createdAt))
        ),
    [messages, threadId]
  );

  // Identifica o outro usuário e obtém dados
  const otherId = useMemo(() => {
    if (!thread || !currentUser) return '';
    return thread.userA === currentUser.id ? thread.userB : thread.userA;
  }, [thread, currentUser]);

  const otherUser = useMemo(
    () => users.find((u: any) => u.id === otherId) ?? null,
    [users, otherId]
  );

  const displayName = (otherUser && (otherUser.name || otherUser.username)) || `@${otherId}`;

  const avatarUri = otherUser?.avatarUri ?? null;

  function scrollToEndSmooth() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });
  }

  async function markThreadSeen() {
    if (!currentUser?.id || !threadId) return;
    const key = `@cj:lastSeen:thread:${currentUser.id}:${threadId}`;
    try {
      await AsyncStorage.setItem(key, Date.now().toString());
    } catch {
      // silêncio: se falhar, apenas não atualiza não lidas
    }
  }

  useEffect(() => {
    // Ao montar (e quando troca thread), marca visto e rola para o fim
    markThreadSeen();
    scrollToEndSmooth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    // Quando chegam novas mensagens, marca visto e rola
    markThreadSeen();
    scrollToEndSmooth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadMessages.length]);

  if (!thread) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>Conversa não encontrada.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.green, fontWeight: '700' }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  async function handleSend() {
    const t = text.trim();
    if (!t) return;
    await sendMessage(thread.id, t);
    setText('');
    // o scroll também será disparado pelo efeito acima (threadMessages.length)
  }

  function openProfile() {
    router.push({ pathname: '/(panel)/user/[id]/page', params: { id: otherId } });
  }

  return (
    <View style={styles.container}>
      {/* Header com avatar + nome clicável */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>

        <Pressable onPress={openProfile} style={styles.headerUser}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
              <Ionicons name="person" size={16} color={colors.darkGreen} />
            </View>
          )}
          <Text style={styles.logoText}>{displayName}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <FlatList
          ref={listRef}
          data={threadMessages}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => {
            const mine = item.senderId === currentUser.id;
            return (
              <View style={[styles.msgRow, mine ? styles.right : styles.left]}>
                <View style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft]}>
                  <Text style={{ color: mine ? 'white' : '#222' }}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={scrollToEndSmooth}
          onLayout={scrollToEndSmooth}
        />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Escreva uma mensagem..."
            style={styles.input}
            value={text}
            onChangeText={setText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const HEADER_AVATAR = 26;

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
    backgroundColor: 'rgba(255,255,255, 0.55)',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginBottom: 0,
  },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerAvatar: {
    width: HEADER_AVATAR,
    height: HEADER_AVATAR,
    borderRadius: HEADER_AVATAR / 2,
  },
  headerAvatarFallback: {
    backgroundColor: '#e8f0ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  body: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  msgRow: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 8 },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  bubbleLeft: { backgroundColor: '#F1F1F1', borderTopLeftRadius: 4 },
  bubbleRight: { backgroundColor: colors.green, borderTopRightRadius: 4 },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});