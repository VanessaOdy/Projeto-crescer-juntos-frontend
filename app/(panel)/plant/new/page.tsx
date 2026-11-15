//app/(panel)/plant/new/page.tsx

import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

//---Configuração da API--
const API_URL = "http://192.168.0.178:8000/api/plantas/";

export default function NewPlantPage() {
  const [imageUri, setImageUri] = useState<string>('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [origin, setOrigin] = useState('');
  const [family, setFamily] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Conceda acesso à galeria para selecionar a imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (loading) return;
  if (!imageUri || !name || !type || !origin || !family || !description) {
    Alert.alert(
      'Campos obrigatórios',
      'Preencha todos os campos e selecione uma imagem.'
    );
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append('nome_popular', name);
    formData.append('tipo', type);
    formData.append('origem', origin);
    formData.append('familia', family);
    formData.append('descricao', description);
    formData.append('usuario', '1');

    formData.append(
      'imagem',
      {
        uri: imageUri,
        name: 'planta.jpg',
        type: 'image/jpeg',
      } as any
    );

    console.log('SALVANDO PLANTA');

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      Alert.alert('Erro', JSON.stringify(data));
      return;
    }

    Alert.alert(
      'Sucesso',
      'Planta cadastrada com foto!'
    );
    setImageUri('');
    setName('');
    setOrigin('');
    setType('');
    setFamily('');
    setDescription('');

    router.replace('/(panel)/home/page');

  } catch (error) {
    console.log(error);

    Alert.alert(
      'Erro',
      'Não foi possível salvar a planta.'
    );
  } finally {
    setLoading(false);
  }
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
        <Text style={styles.slogan}>Cadastrar Planta</Text>
      </View>

      <ScrollView style={styles.form}>
        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <>
              <Ionicons name="image" size={36} color={colors.darkGreen} />
              <Text style={{ color: colors.darkGreen, marginTop: 8 }}>
                Selecionar imagem
              </Text>
            </>
          )}
        </Pressable>

        <View>
          <Text style={styles.label}>Nome da planta</Text>
          <TextInput placeholder="Ex.: Samambaia" style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View>
          <Text style={styles.label}>Tipo</Text>
          <TextInput placeholder="Ex.: Herbácea, Arbusto, etc." style={styles.input} value={type} onChangeText={setType} />
        </View>

        <View>
          <Text style={styles.label}>Origem</Text>
          <TextInput placeholder="Ex.: América do Sul" style={styles.input} value={origin} onChangeText={setOrigin} />
        </View>

        <View>
          <Text style={styles.label}>Família</Text>
          <TextInput placeholder="Ex.: Pteridaceae" style={styles.input} value={family} onChangeText={setFamily} />
        </View>

        <View>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            placeholder="Características, cuidados, etc."
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Pressable
          style={[
            styles.button,
            loading && { opacity: 0.5 }
          ]}
          onPress={loading ? undefined : handleSave}
        >
          <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
        </Pressable>
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
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 28,
    color: colors.white,
    marginBottom: 14,
  },
  form: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 14,
  },
  imagePicker: {
    height: 220,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 10,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  preview: { width: '100%', height: '100%', borderRadius: 10 },
  label: { color: colors.darkGreen, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.gray, borderRadius: 8,
    marginBottom: 16, paddingHorizontal: 8, paddingVertical: 12,
  },
  button: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: { color: colors.white, fontWeight: 'bold' },
});