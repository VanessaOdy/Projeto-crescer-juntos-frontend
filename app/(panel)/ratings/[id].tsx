import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

//---Configuração da API--
const API_URL = 'http://127.0.0.1:8000/api/avaliacoes';

export default function RatingsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const targetUserId = id!;

  const { ratings, addRating } = useFeed();

  const targetRatings = useMemo(
    () => ratings.filter(r => r.targetUserId === targetUserId),
    [ratings, targetUserId]
  );

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const avg =
    targetRatings.length === 0
      ? 0
      : targetRatings.reduce((acc, cur) => acc + cur.score, 0) / targetRatings.length;

  async function handleSubmit() {
    if (!score || score < 1 || score > 5) {
      Alert.alert('Nota inválida', 'A nota deve ser de 1 a 5.');
      return;
    }
    await addRating({ targetUserId, score, comment: comment.trim() || undefined });
    setScore(5);
    setComment('');
    Alert.alert('Obrigado!', 'Sua avaliação foi registrada.');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>

        <Text style={styles.logoText}>
          Avaliações de @{targetUserId}
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 14 }}>
        {/* Caixa de avaliação */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Avaliar usuário</Text>

          {/* Estrelas */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable key={n} onPress={() => setScore(n)} style={{ padding: 4 }}>
                <Ionicons
                  name={n <= score ? 'star' : 'star-outline'}
                  size={28}
                  color={colors.green}
                />
              </Pressable>
            ))}
            <Text style={{ marginLeft: 8, color: colors.darkGreen, fontWeight: '700' }}>
              {score.toFixed(0)}/5
            </Text>
          </View>

          {/* Comentário */}
          <TextInput
            placeholder="Comentário (opcional)"
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            multiline
          />

          {/* Botão enviar */}
          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar avaliação</Text>
          </Pressable>
        </View>

        {/* Lista de avaliações */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>
            Média: {avg.toFixed(1)} ★ ({targetRatings.length})
          </Text>

          {targetRatings.length === 0 ? (
            <Text style={{ color: colors.gray }}>Ainda não há avaliações.</Text>
          ) : (
            targetRatings.map(r => (
              <View key={r.id} style={styles.ratingItem}>
                {/* Estrelas da avaliação */}
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Ionicons
                      key={n}
                      name={n <= r.score ? 'star' : 'star-outline'}
                      size={16}
                      color={colors.green}
                    />
                  ))}
                </View>

                {/* Comentário */}
                {r.comment ? (
                  <Text style={{ marginBottom: 4 }}>{r.comment}</Text>
                ) : null}

                {/* Data removida completamente (como solicitado) */}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkGreen, paddingTop: 34 },

  header: { paddingHorizontal: 14 },

  backButton: {
    backgroundColor: 'rgba(255,255,255, 0.55)',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  logoText: { fontSize: 20, fontWeight: 'bold', color: colors.white, marginBottom: 8 },

  body: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  box: {
    backgroundColor: '#F7FAF8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  boxTitle: { color: colors.darkGreen, fontWeight: '700', marginBottom: 10 },

  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
    marginBottom: 10,
  },

  button: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  buttonText: { color: colors.white, fontWeight: '700' },

  ratingItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
});
