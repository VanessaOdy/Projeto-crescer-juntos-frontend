//app/(panel)/plant/[id]/page.tsx

import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PlantDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, posts, deletePlant } = useFeed();

  const plant = useMemo(() => plants.find(p => p.id === id), [plants, id]);
  const plantPost = useMemo(() => posts.find(p => p.plantId === id), [posts, id]);

  if (!plant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>Planta não encontrada.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.green, fontWeight: '700' }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  function confirmDeletePlant() {
    Alert.alert('Apagar planta', 'Apagar a planta remove os posts e comentários dela. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deletePlant(plant.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.logoText}>
          Crescer<Text style={{ color: colors.green }}>Juntos</Text>
        </Text>
        <Text style={styles.slogan}>Detalhes da Planta</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 14 }}>
        {!!plant.imageUri && <Image source={{ uri: plant.imageUri }} style={styles.image} />}

        <View style={styles.row}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{plant.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{plant.type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Origem:</Text>
          <Text style={styles.value}>{plant.origin}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Família:</Text>
          <Text style={styles.value}>{plant.family}</Text>
        </View>

        <Text style={[styles.label, { marginTop: 10 }]}>Descrição:</Text>
        <Text style={styles.value}>{plant.description}</Text>

        <Pressable style={styles.deleteBtn} onPress={confirmDeletePlant}>
          <Ionicons name="trash" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8 }}>Apagar planta</Text>
        </Pressable>

        {!!plantPost && (
          <Text style={{ color: '#777', fontSize: 12, marginTop: 6 }}>
            Obs.: O post e comentários desta planta também serão removidos.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkGreen, paddingTop: 34 },
  header: { paddingHorizontal: 14 },
  backButton: {
    backgroundColor: 'rgba(255,255,255, 0.55)', alignSelf: 'flex-start', padding: 8, borderRadius: 8, marginBottom: 8,
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  slogan: { fontSize: 28, color: colors.white, marginBottom: 14 },
  body: {
    flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  image: { width: '100%', height: 280, borderRadius: 8, marginBottom: 12, backgroundColor: '#eee' },
  row: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  label: { color: colors.darkGreen, fontWeight: '800' },
  value: { color: '#333', flex: 1, flexWrap: 'wrap' },
  deleteBtn: {
    marginTop: 12, backgroundColor: '#D9534F', paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
});