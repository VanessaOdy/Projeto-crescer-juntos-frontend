import colors from '@/constants/colors';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TrocasPage() {
    const [trocas, setTrocas] = useState<any[]>([]);
    const [plantas, setPlantas] = useState<any[]>([]);

  useEffect(() => {
  carregarTrocas();
  carregarPlantas();
}, []);

  async function carregarTrocas() {
  try {
    const response = await fetch(
      'http://192.168.0.178:8000/api/trocas/'
    );

    const data = await response.json();

    setTrocas(data.results || []);
  } catch (error) {
    console.log(error);
  }
}

  async function carregarPlantas() {
  try {
    const response = await fetch(
      'http://192.168.0.178:8000/api/plantas/'
    );

    const data = await response.json();

    setPlantas(data.results || data);

  } catch (error) {
    console.log(error);
  }
}
async function atualizarStatus(
  idTroca: number,
  novoStatus: string
) {
  try {
    await fetch(
      `http://192.168.0.178:8000/api/trocas/${idTroca}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: novoStatus,
        }),
      }
    );

    carregarTrocas();

  } catch (error) {
    console.log(error);
  }
}
function nomePlanta(id: number) {
  const planta = plantas.find(
    (p: any) => p.id_planta === id
  );

  return planta
    ? planta.nome_popular
    : `Planta ${id}`;
}
  return (
  <View style={styles.container}>

    <View style={styles.header}>
      <Text style={styles.logoText}>
        Crescer<Text style={{ color: colors.green }}>Juntos</Text>
      </Text>

      <Text style={styles.slogan}>
        Minhas Trocas
      </Text>
      
    </View>

    <FlatList
        data={trocas}
        contentContainerStyle={{
        padding: 16,
        }}
        keyExtractor={(item: any) =>
          item.id_troca.toString()
        }
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.texto}>
  🌱 {nomePlanta(item.planta_origem)}
</Text>

<Text
  style={{
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 8,
  }}
>
  🔄
</Text>

<Text style={styles.texto}>
  🌿 {nomePlanta(item.planta_destino)}
</Text>

            <Text
                style={[
                    styles.status,
                    {
                    color:
                        item.status === 'Aceita'
                        ? 'green'
                        : item.status === 'Recusada'
                        ? 'red'
                        : '#ff9800',
                    },
                ]}
                >
                Status: {item.status}
                </Text>

            <Text style={styles.data}>
              Data: {item.data}
            </Text>
            <View style={styles.botoes}>
                <Text
                    style={styles.aceitar}
                    onPress={() =>
                    atualizarStatus(
                        item.id_troca,
                        'Aceita'
                    )
                    }
                >
                    ✅ Aceitar
                </Text>

                <Text
                    style={styles.recusar}
                    onPress={() =>
                    atualizarStatus(
                        item.id_troca,
                        'Recusada'
                    )
                    }
                >
                    ❌ Recusar
                </Text>
                </View>
          </View>
        )}
      />
    </View>
    
  );
  
}



const styles = StyleSheet.create({
    header: {
  backgroundColor: colors.darkGreen,
  paddingTop: 34,
  paddingHorizontal: 14,
  paddingBottom: 14,
},

logoText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.white,
},

slogan: {
  fontSize: 28,
  color: colors.white,
  marginTop: 6,
},

  container: {
  flex: 1,
  backgroundColor: '#fff',
},

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.darkGreen,
    marginBottom: 16,
  },

    card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: colors.green,
  },
  
  texto: {
    fontSize: 16,
    marginBottom: 4,
  },

  status: {
    fontWeight: 'bold',
    color: colors.green,
  },

  data: {
    color: '#666',
    marginTop: 4,
  },
  botoes: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
    },

    aceitar: {
    color: 'green',
    fontWeight: 'bold',
    },

    recusar: {
    color: 'red',
    fontWeight: 'bold',
    },
});