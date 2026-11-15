import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { ensurePersistentUri } from '@/utils/image';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, {
  useCallback,
  useState
} from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProfilePage() {
  const {
    currentUser,
    getUserAverageRating,
    updateCurrentUser,
  } = useFeed();

  const avg = getUserAverageRating(currentUser.id);


  

  const [editVisible, setEditVisible] = useState(false);
  // Nome é fixo → modal não edita nome
  const [bio, setBio] = useState(currentUser.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    currentUser.avatarUri
  );

  const [minhasPlantas, setMinhasPlantas] = useState<any[]>([]);
  const [totalTrocas, setTotalTrocas] = useState(0);
  useFocusEffect(
  useCallback(() => {
    carregarMinhasPlantas();
    carregarTrocas();
  }, [])
);

async function carregarMinhasPlantas() {
  try {
    const response = await fetch(
      'http://192.168.0.178:8000/api/plantas/'
    );

    const data = await response.json();

    if (data.results) {
      setMinhasPlantas(data.results);
    } else {
      setMinhasPlantas(data);
    }
  } catch (error) {
    console.log(error);
  }
}

async function carregarTrocas() {
  try {
    const response = await fetch(
      'http://192.168.0.178:8000/api/trocas/'
    );

    const data = await response.json();

    if (data.results) {
      setTotalTrocas(data.results.length);
    } else {
      setTotalTrocas(data.length);
    }
  } catch (error) {
    console.log(error);
  }
}

  function resetEditState() {
    setBio(currentUser.bio ?? '');
    setAvatarUri(currentUser.avatarUri);
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Conceda acesso à galeria para selecionar uma foto.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const persisted = await ensurePersistentUri(
        result.assets[0].uri,
        'avatar'
      );
      setAvatarUri(persisted);
    }
  }

  async function handleSaveProfile() {
    // Nome não é editado → salvar apenas Bio e Avatar
    await updateCurrentUser({ bio: bio.trim(), avatarUri });
    setEditVisible(false);
  }

  function renderStarRow(value: number) {
    const rounded = Math.round(value);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name={n <= rounded ? 'star' : 'star-outline'}
            size={16}
            color={colors.green}
          />
        ))}
        <Text
          style={{
            marginLeft: 6,
            color: colors.darkGreen,
            fontWeight: '700',
          }}
        >
          {value.toFixed(1)}
        </Text>
      </View>
    );
  }

  /** Confirmação antes de deslogar (alerta) */
  function confirmLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: handleLogout },
    ]);
  }

  /** Logout (Opção B):
   * - Remove somente @cj:currentUser do storage
   * - Faz reset leve do usuário em memória (evita "flash" ao sair)
   * - Limpa a pilha de navegação e volta ao Login (/)
   */
  async function handleLogout() {
    try {
      // Fecha modal se estiver aberto (por segurança)
      setEditVisible(false);

      // Remove apenas o usuário atual do AsyncStorage
      await AsyncStorage.removeItem('@cj:currentUser');

      // Reset leve em memória (não apaga plantas/posts/etc.)
      await updateCurrentUser({
        name: 'Você',
        email: undefined,
        password: undefined,
        avatarUri: undefined,
        bio: '',
      });

      // Limpa qualquer pilha/modais e navega para login
      router.dismissAll();
      setTimeout(() => {
        router.replace('/');
      }, 0);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Crescer<Text style={{ color: colors.green }}>Juntos</Text>
        </Text>
      </View>

  
          <View style={styles.profileHeader}>
            <Pressable onPress={pickAvatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={44} color={colors.darkGreen} />
                </View>
              )}
            </Pressable>

            <View style={styles.infoRight}>
              {/* Nome fixo (o mesmo do cadastro) */}
              <Text style={styles.name}>{currentUser.name}</Text>
              {/* (Opcional) e-mail abaixo do nome */}
              {!!currentUser.email && (
                <Text style={{ color: '#555', marginTop: 2 }}>
                  {currentUser.email}
                </Text>
              )}

              {!!bio && <Text style={styles.bio}>{bio}</Text>}

              <View style={{ marginTop: 6 }}>{renderStarRow(avg)}</View>

              <View style={styles.countsRow}>
                    <View style={styles.countItem}>
                      <Text style={styles.countNumber}>
                        {minhasPlantas.length}
                      </Text>
                      <Text style={styles.countLabel}>
                        Plantas
                      </Text>
                    </View>

                    <View style={styles.countItem}>
                      <Text style={styles.countNumber}>
                        {totalTrocas}
                      </Text>
                      <Text style={styles.countLabel}>
                        Trocas
                      </Text>
                    </View>
                  </View>

              {/* Ações do perfil */}
              <View style={styles.actionsColumn}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.green }]}
                  onPress={() => setEditVisible(true)}
                >
                  <Text style={styles.actionText}>Editar Perfil</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.darkGreen },
                  ]}
                  onPress={() => router.push('/(panel)/plant/new/page')}
                >
                  <Text style={styles.actionText}>Nova Planta</Text>
                </Pressable>
                <Pressable
                    style={[
                      styles.actionBtn,
                      { backgroundColor: '#8BC34A' },
                    ]}
                    onPress={() => router.push('/(panel)/minhas-plantas/page')}
                  >
                    <Text style={styles.actionText}>
                      Minhas Plantas
                    </Text>
                  </Pressable>
                <Pressable
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.darkGreen },
                  ]}
                  onPress={() => router.push('/(panel)/trocas/page')}
                >
                  <Text style={styles.actionText}>Minhas Trocas</Text>
                </Pressable>
              </View>

              {/* Botão Deslogar */}
              <Pressable style={styles.logoutBtn} onPress={confirmLogout}>
                <Ionicons name="log-out-outline" size={18} color="white" />
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '700',
                    marginLeft: 8,
                  }}
                >
                  Sair
                </Text>
              </Pressable>
            </View>
          </View>


      {/* Modal de edição (somente Bio e Avatar) */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <Pressable onPress={pickAvatar} style={{ alignSelf: 'center' }}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.modalAvatar} />
              ) : (
                <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={54} color={colors.darkGreen} />
                </View>
              )}
            </Pressable>

            {/* Apenas BIO editável */}
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Fale um pouco sobre você..."
              multiline
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 8,
              }}
            >
              <Pressable
                style={[
                  styles.smallBtn,
                  { backgroundColor: '#ddd', marginRight: 8 },
                ]}
                onPress={() => {
                  resetEditState();
                  setEditVisible(false);
                }}
              >
                <Text style={{ color: '#333', fontWeight: '700' }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.smallBtn, { backgroundColor: colors.green }]}
                onPress={handleSaveProfile}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  header: {
    backgroundColor: colors.darkGreen,
    paddingTop: 34,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  logoText: { fontSize: 20, fontWeight: 'bold', color: colors.white },

  profileHeader: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#F4F8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#e8f0ea',
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dfe7e1',
  },

  infoRight: { flex: 1, marginLeft: 12 },

  name: { color: colors.darkGreen, fontSize: 18, fontWeight: '700' },

  bio: { color: '#333', marginTop: 4 },

  countsRow: { flexDirection: 'row',  marginTop: 12,  justifyContent: 'space-evenly'},

  countItem: { alignItems: 'center' },

  countNumber: { color: colors.darkGreen, fontWeight: '800' },

  countLabel: { color: '#666', fontSize: 12 },

  actionsColumn: { marginTop: 16, gap: 10},

  actionBtn: {paddingVertical: 12, borderRadius: 8,  width: '100%',  alignItems: 'center'},

  actionText: { color: colors.white, fontWeight: '700' },

  // Botão sair
  logoutBtn: {
    marginTop: 12,
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },

  gridItem: { width: '33.333%', aspectRatio: 1, padding: 2 },

  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#eee',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCard: {
    width: '88%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
  },

  modalTitle: {
    color: colors.darkGreen,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 10,
  },

  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f0ea',
    marginBottom: 10,
  },

  inputLabel: { color: colors.darkGreen, marginTop: 6, marginBottom: 4 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  

  smallBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
});