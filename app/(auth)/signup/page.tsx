//app/(auth)/signup/page.tsx
import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//---Configuração da API--
const API_URL = 'http://192.168.0.178:8000/api/usuarios/';

// --- Máscaras e validações --- //
const onlyDigits = (v: string) => v.replace(/\D+/g, '');

function maskCEP(v: string) {
  const digits = onlyDigits(v).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
function validateCEP(v: string) {
  const digits = onlyDigits(v);
  return digits.length === 8;
}

function maskUF(v: string) {
  return v.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
}
function validateUF(v: string) {
  return /^[A-Z]{2}$/.test(v);
}

// Letras com acentos + espaços, até 100
function maskLetters100(v: string) {
  return v.normalize('NFC').replace(/[^\p{L}\s]/gu, '').slice(0, 100);
}
function validateLetters1to100(v: string) {
  return v.trim().length > 0 && v.trim().length <= 100;
}

function maskNumero(v: string) {
  return onlyDigits(v).slice(0, 11);
}
function validateNumero(v: string) {
  return /^\d{1,11}$/.test(v);
}

// dd/mm/aaaa
function maskDateBR(v: string) {
  const digits = onlyDigits(v).slice(0, 8);
  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 4);
  const p3 = digits.slice(4, 8);
  if (digits.length <= 2) return p1;
  if (digits.length <= 4) return `${p1}/${p2}`;
   return `${p1}/${p2}/${p3}`;
}
function validateDateBR(v: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
  const [dd, mm, yyyy] = v.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const monthMax = [
    31,
    (yyyy % 4 === 0 && (yyyy % 100 !== 0 || yyyy % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];
  if (dd > monthMax[mm - 1]) return false;
  if (yyyy < 1900 || yyyy > 2100) return false;
  return true;
}

// Data de hoje (dd/mm/aaaa)
function getTodayBR(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Regex de e-mail (apenas para bloquear o envio; não exibiremos texto de erro)
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
}

export default function Signup() {
  // Dados básicos
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');         // validado com regex, sem mensagem na tela
  const [password, setPassword] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');

  // Data (dd/mm/aaaa)
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Preenche data automaticamente
  useEffect(() => {
    if (!date) setDate(getTodayBR());
  }, [date]);

  // Erros dinâmicos (sem exibir texto específico para email inválido)
  const errors = useMemo(() => {
    const isEmailEmpty = email.trim().length === 0;
    const isEmailInvalid = !isEmailEmpty && !validateEmail(email);

    return {
      name: !(name.trim().length > 0),
      email: isEmailEmpty || isEmailInvalid,   // usamos apenas para borda/vermelho e desabilitar submit
      password: !(password.trim().length > 0),
      cep: !validateCEP(cep),
      uf: !validateUF(uf),
      cidade: !validateLetters1to100(cidade),
      rua: !validateLetters1to100(rua),
      numero: !validateNumero(numero),
      date: !validateDateBR(date),
    };
  }, [name, email, password, cep, uf, cidade, rua, numero, date]);

  const hasErrors = useMemo(
    () => Object.values(errors).some(Boolean),
    [errors]
  );

  async function handleSignUp() {
  if (hasErrors) {
    Alert.alert(
      'Atenção',
      'Verifique os campos informados e tente novamente.'
    );
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: name.trim(),
    email: email.trim(),
    senha: password,
    localizacao: cidade.trim(),
  }),
});

const text = await response.text();

console.log('STATUS:', response.status);
console.log('RESPOSTA:', text);

if (!response.ok) {
  Alert.alert('Erro', text);
  return;
}

Alert.alert(
  'Sucesso',
  'Usuário cadastrado com sucesso!'
);

router.replace('/');
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.white }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </Pressable>

            <Text style={styles.logoText}>
              Crescer<Text style={{ color: colors.green }}>Juntos</Text>
            </Text>

            <Text style={styles.slogan}>Criar uma conta</Text>
          </View>

          <View style={styles.form}>
            {/* Nome */}
            <View>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                placeholder="Nome completo..."
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>Informe seu nome completo.</Text>}
            </View>

            {/* Email (sem mensagem "email inválido") */}
            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Digite seu email..."
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              {/* Sem mensagem específica aqui */}
            </View>

            {/* Senha */}
            <View>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                placeholder="Digite sua senha..."
                style={[styles.input, errors.password && styles.inputError]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && <Text style={styles.errorText}>Informe uma senha.</Text>}
            </View>

            {/* Endereço */}
            <Text style={[styles.label, { marginTop: 8, fontWeight: '700' }]}>Endereço</Text>

            {/* CEP */}
            <View>
              <Text style={styles.smallLabel}>CEP</Text>
              <TextInput
                placeholder="00000-000"
                style={[styles.input, errors.cep && styles.inputError]}
                value={cep}
                onChangeText={(t) => setCep(maskCEP(t))}
                keyboardType="numeric"
                maxLength={9}
              />
              {errors.cep && <Text style={styles.errorText}>Digite seu CEP.</Text>}
            </View>

            {/* UF + Número */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.smallLabel}>UF</Text>
                <TextInput
                  placeholder="SC"
                  style={[styles.input, errors.uf && styles.inputError]}
                  value={uf}
                  onChangeText={(t) => setUf(maskUF(t))}
                  autoCapitalize="characters"
                  maxLength={2}
                />
                {errors.uf && <Text style={styles.errorText}>Digite seu UF.</Text>}
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.smallLabel}>Número</Text>
                <TextInput
                  placeholder="Número"
                  style={[styles.input, errors.numero && styles.inputError]}
                  value={numero}
                  onChangeText={(t) => setNumero(maskNumero(t))}
                  keyboardType="numeric"
                  maxLength={11}
                />
                {errors.numero && <Text style={styles.errorText}>Digite seu Número de endereço.</Text>}
              </View>
            </View>

            {/* Cidade */}
            <View>
              <Text style={styles.smallLabel}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                style={[styles.input, errors.cidade && styles.inputError]}
                value={cidade}
                onChangeText={(t) => setCidade(maskLetters100(t))}
                autoCapitalize="words"
              />
              {errors.cidade && <Text style={styles.errorText}>Digite sua Cidade.</Text>}
            </View>

            {/* Rua */}
            <View>
              <Text style={styles.smallLabel}>Rua</Text>
              <TextInput
                placeholder="Rua"
                style={[styles.input, errors.rua && styles.inputError]}
                value={rua}
                onChangeText={(t) => setRua(maskLetters100(t))}
                autoCapitalize="words"
              />
              {errors.rua && <Text style={styles.errorText}>Digite sua Rua.</Text>}
            </View>

            {/* Data do Cadastro */}
            <View>
              <Text style={styles.label}>Data do cadastro (dd/mm/aaaa)</Text>
              <TextInput
                placeholder="dd/mm/aaaa"
                style={[styles.input, errors.date && styles.inputError]}
                value={date}
                onChangeText={(t) => setDate(maskDateBR(t))}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.date && <Text style={styles.errorText}>Informe uma data válida (ex.: 28/01/2026).</Text>}
            </View>

            {/* Botão cadastrar */}
            <Pressable
              style={[styles.button, (loading || hasErrors) && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={loading || hasErrors}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 34, backgroundColor: colors.darkGreen },
  header: { paddingLeft: 14, paddingRight: 14 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  slogan: { fontSize: 34, color: colors.white, marginBottom: 34 },
  form: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingLeft: 14,
    paddingRight: 14,
  },
  label: { color: colors.darkGreen, marginBottom: 4 },
  smallLabel: { color: colors.darkGreen, marginBottom: 4, fontSize: 12 },
  row: { flexDirection: 'row' },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#D9534F' },
  errorText: { color: '#D9534F', fontSize: 12, marginBottom: 6 },
  button: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: { color: colors.white, fontWeight: 'bold' },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
});