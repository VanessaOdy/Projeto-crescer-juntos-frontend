import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = 'http://192.168.0.178:8000/api/plantas/';

export default function HomePage() {
  const [plantas, setPlantas] = useState<any[]>([]);

  useFocusEffect(
  React.useCallback(() => {
    carregarPlantas();
  }, [])
);

  async function carregarPlantas() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (data.results) {
      setPlantas(data.results);
    } else {
      setPlantas(data);
    }

  } catch (error) {
    console.log(error);
  }
}


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Crescer<Text style={{ color: colors.green }}>Juntos</Text>
        </Text>

        {/* Botão Direct (topo direito) */}
        <Link href='/(panel)/direct/list' asChild>
          <Pressable style={styles.dmBtn}>
            <Ionicons name="paper-plane-outline" size={22} color={colors.white} />
          </Pressable>
        </Link>

        <Text style={styles.slogan}>Feed</Text>
      </View>

      <ScrollView style={styles.feed}>
        {plantas.length === 0 ? (
  <View style={{ padding: 16 }}>
    <Text style={{ color: colors.gray }}>
      Nenhuma planta cadastrada.
    </Text>
  </View>
) : (
  plantas.map((planta) => (
  <View
    key={planta.id_planta}
    style={{
      backgroundColor: '#fff',
      margin: 12,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
    }}
  >
    {planta.imagem ? (
      <Image
  source={{
    uri: planta.imagem,
  }}
  style={{
    width: '100%',
    height: 200,
  }}
  resizeMode="cover"
/>
    ) : null}

    <View style={{ padding: 12 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
        }}
      >
        {planta.nome_popular}
      </Text>

      <Text>{planta.tipo}</Text>
      <Text>{planta.origem}</Text>
      <Text>{planta.familia}</Text>

      <Text style={{ marginTop: 8 }}>
        {planta.descricao}
      </Text>
    </View>
  </View>
))
)}
</ScrollView>
</View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkGreen, paddingTop: 34 },
  header: { paddingHorizontal: 14 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  slogan: { fontSize: 28, color: colors.white, marginVertical: 12 },
  feed: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dmBtn: {
    position: 'absolute',
    right: 14,
    top: 34,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 8,
  },
});