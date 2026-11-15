//app/index.tsx

import colors from '@/constants/colors';
import { useFeed } from '@/context/FeedContext';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';


export default function Login() {
  const { updateCurrentUser } = useFeed();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

      async function handleSignIn() {
  if (!email || !password) {
    Alert.alert('Atenção', 'Preencha email e senha.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      'http://192.168.0.178:8000/api/login/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: password,
        }),
      }
    );

    const data = await response.json();

    console.log('LOGIN:', data);

    if (!response.ok) {
      Alert.alert(
        'Erro',
        data.message || 'Email ou senha inválidos.'
      );
      return;
    }

    await updateCurrentUser({
      id: String(data.id_usuario),
      name: data.nome,
      email: data.email,
    });

    Alert.alert(
      'Sucesso',
      'Login realizado com sucesso!'
    );

    router.replace('/(panel)/home/page');

  } catch (error) {
    console.log(error);

    Alert.alert(
      'Erro',
      'Não foi possível conectar ao servidor.'
    );
  } finally {
    setLoading(false);
  }
}
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Crescer<Text style={{ color: colors.green }}>Juntos</Text>
        </Text>

        <Text style={styles.slogan}>Conectando pessoas e plantas</Text>
      </View>

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Digite seu email..."
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha..."
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Pressable
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar'}</Text>
        </Pressable>

        <Link href='/(auth)/signup/page' asChild>
          <Pressable style={{ marginTop: 16, alignSelf: 'center' }}>
            <Text style={styles.link}>Ainda não possui uma conta? Cadastre-se</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex: 1, paddingTop: 34, backgroundColor: colors.darkGreen },
  header:{ paddingLeft: 14, paddingRight: 14 },
  logoText:{ fontSize: 20, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  slogan:{ fontSize:34, color: colors.white, marginBottom: 34 },
  form:{
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingLeft: 14,
    paddingRight: 14,
  },
  label:{ color: colors.darkGreen, marginBottom: 4 },
  input:{
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 14, 
    backgroundColor: '#fff',
  },
  button:{
    backgroundColor: colors.green,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 8,
  },
  buttonText:{ color: colors.white, fontWeight: 'bold' },
  link:{ color: colors.darkGreen, fontWeight: '700' },
});
