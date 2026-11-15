import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Comment, Post } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

//---Configuração da API--
const API_URL = 'http://127.0.0.1:8000/api/mensagens';


type Props = { post: Post };

export default function PostCard({ post }: Props) {
  const { comments, addComment, plants, currentUser, getUserById } = useFeed();

  // Comentários do post (ordenados por data asc)
  const postComments = useMemo(
    () =>
      comments
        .filter(c => c.postId === post.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [comments, post.id]
  );

  // Planta referente a este post
  const plant = useMemo(
    () => plants.find(p => p.id === post.plantId),
    [plants, post.plantId]
  );

  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState('');

  async function handleSend() {
    const t = text.trim();
    if (!t) return;
    await addComment({ postId: post.id, text: t });
    setText('');
  }

  // Autor do post
  const author = getUserById(post.ownerId) || (post.ownerId === currentUser.id ? currentUser : undefined);
  const isMe = author?.id === currentUser.id;
  const authorName = author?.name?.trim() || author?.id || 'usuario';
  const authorAvatar = author?.avatarUri;

  function openAuthorProfile() {
    if (isMe) router.push('/(panel)/profile/page');
    else router.push({ pathname: '/(panel)/user/[id]/page', params: { id: author?.id ?? post.ownerId } });
  }

  return (
    <View style={styles.card}>
      {/* Cabeçalho do post: avatar + nome do autor (clicáveis) */}
      <View style={styles.postHeader}>
        <Pressable style={styles.authorRow} onPress={openAuthorProfile}>
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={18} color={colors.darkGreen} />
            </View>
          )}
          <Text style={styles.author}>@{authorName}</Text>
        </Pressable>
      </View>

      {/* Imagem do post (foto da planta) */}
      {!!post.imageUri && (
        <Image source={{ uri: post.imageUri }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Legenda (se existir) */}
      {!!post.caption && <Text style={styles.caption}>{post.caption}</Text>}

      {/* ===== Bloco de Informações da Planta (nome, tipo, origem, família, descrição) ===== */}
      {plant ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{plant.name}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{plant.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Origem:</Text>
            <Text style={styles.infoValue}>{plant.origin}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Família:</Text>
            <Text style={styles.infoValue}>{plant.family}</Text>
          </View>

          {!!plant.description && (
            <>
              <Text style={[styles.infoLabel, { marginTop: 6 }]}>Descrição:</Text>
              <Text style={styles.infoDescription}>{plant.description}</Text>
            </>
          )}
        </View>
      ) : (
        <Text style={styles.mutedText}>Informações da planta não encontradas.</Text>
      )}

      {/* Ações */}
      <View style={styles.actions}>
        <Pressable style={styles.iconBtn} onPress={() => setShowComments(true)}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.darkGreen} />
          <Text style={styles.iconText}>{postComments.length}</Text>
        </Pressable>
      </View>

      {/* Comentários (modal) */}
      <Modal visible={showComments} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comentários</Text>
            <Pressable style={styles.closeBtn} onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={22} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.chat}>
            {postComments.length === 0 ? (
              <Text style={{ color: colors.gray }}>Seja o primeiro a comentar!</Text>
            ) : (
              postComments.map((c: Comment) => (
                <View key={c.id} style={styles.chatBubble}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatUser}>@usuario</Text>
                  </View>
                  <Text style={styles.chatText}>{c.text}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Escreva um comentário..."
              style={styles.input}
              value={text}
              onChangeText={setText}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Pressable style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },

  postHeader: { paddingHorizontal: 12, paddingTop: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e3efe6' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dfe7e1' },
  author: { color: colors.darkGreen, fontWeight: '700' },

  postImage: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  caption: { paddingHorizontal: 12, paddingVertical: 10, color: '#222' },

  infoBox: {
    backgroundColor: '#F7FAF8',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5eee8',
  },
  infoTitle: { color: colors.darkGreen, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  infoRow: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  infoLabel: { color: colors.darkGreen, fontWeight: '700' },
  infoValue: { color: '#333', flexShrink: 1 },
  infoDescription: { color: '#333', marginTop: 2 },

  mutedText: { color: '#888', paddingHorizontal: 12, marginTop: 6 },

  actions: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8 },
  iconBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.04)',
  },
  iconText: { color: colors.darkGreen, fontWeight: '600', marginLeft: 6 },

  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    backgroundColor: colors.darkGreen, paddingTop: 46, paddingBottom: 12,
    paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 8 },

  chat: { flex: 1, padding: 12, gap: 10 },
  chatBubble: { backgroundColor: '#F0F7F3', padding: 10, borderRadius: 8 },
  chatHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  chatUser: { fontWeight: '700', color: colors.darkGreen },
  chatText: { fontSize: 14, color: '#222' },

  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  input: {
    flex: 1, borderWidth: 1, borderColor: colors.gray, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff', marginRight: 8,
  },
  sendBtn: {
    backgroundColor: colors.green, paddingHorizontal: 14,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
});