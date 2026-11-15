import colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';


export default function PlantaDetailPage() {
  const { id } = useLocalSearchParams();

  const [planta, setPlanta] = useState<any>(null);

    useEffect(() => {
        carregarPlanta();
        }, 
        [id]);

  async function carregarPlanta() {
    try {
      const response = await fetch(
        `http://192.168.0.178:8000/api/plantas/${id}/`
        );

      const data = await response.json();

      

      setPlanta(data);
    } catch (error) {
      console.log(error);
    }
  }

async function excluirPlanta() {
  Alert.alert(
    'Excluir Planta',
    'Tem certeza que deseja excluir esta planta?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(
              `http://192.168.0.178:8000/api/plantas/${id}/`,
              {
                method: 'DELETE',
              }
            );

            console.log('Status:', response.status);


            if (response.ok || response.status === 204) {
              Alert.alert(
                'Sucesso',
                'Planta excluída com sucesso.'
              );

              router.replace('/(panel)/profile/page');
              
            } else {
              Alert.alert(
                'Erro',
                'Não foi possível excluir a planta.'
              );
            }
          } catch (error) {
            console.log(error);

            Alert.alert(
              'Erro',
              'Falha na comunicação com o servidor.'
            );
          }
        },
      },
    ]
  );
}
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    >
      <View
        style={{
          backgroundColor: colors.darkGreen,
          paddingTop: 34,
          paddingBottom: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          Crescer
          <Text style={{ color: colors.green }}>
            Juntos
          </Text>
        </Text>

        <Text
          style={{
            color: 'white',
            fontSize: 28,
            marginTop: 8,
          }}
        >
          Detalhes da Planta
        </Text>

        <Text
          onPress={() =>
            router.push('/(panel)/minhas-plantas/page')
            }
          style={{
            color: '#E8F5E9',
            fontWeight: '700',
            marginTop: 10,
          }}
        >
          ← Voltar para Minhas Plantas
        </Text>
      </View>

      {!planta ? (
        <Text
          style={{
            padding: 16,
          }}
        >
          Carregando...
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
          }}
        >
            <Text
            style={{
                fontSize: 26,
                fontWeight: 'bold',
                color: colors.darkGreen,
                marginTop: 12,
            }}
            >
          
            </Text>
          {planta.imagem && (
            <Image
              source={{ uri: planta.imagem }}
              resizeMode="cover"
              style={{
                width: '100%',
                height: 250,
                borderRadius: 12,
              }}
            />
          )}

                    <Text
            style={{
              fontSize: 26,
              fontWeight: 'bold',
              color: colors.darkGreen,
              marginTop: 12,
            }}
          >
            {planta.nome_popular}
          </Text>

          <Text
            style={{
              marginTop: 10,
              fontSize: 16,
            }}
          >
            Tipo: {planta.tipo}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 16,
            }}
          >
            Origem: {planta.origem}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 16,
            }}
          >
            Família: {planta.familia}
          </Text>

          <Text
            style={{
              marginTop: 16,
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.darkGreen,
            }}
          >
            Descrição
          </Text>

          <Text
            style={{
              marginTop: 8,
              color: '#555',
              lineHeight: 22,
            }}
          >
            {planta.descricao}
          </Text>
          <Pressable
            onPress={() => router.push('/(panel)/direct/list')}
            style={{
                backgroundColor: '#4A90E2',
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
            }}
            >
            <Text
                style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                }}
            >
                💬 Conversar com proprietário
            </Text>
            </Pressable>
          <Pressable
            onPress={excluirPlanta}
            style={{
                backgroundColor: '#D9534F',
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
            }}
            >
            <Text
                style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                }}
            >
                🗑️ Excluir Planta
            </Text>
            </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
           