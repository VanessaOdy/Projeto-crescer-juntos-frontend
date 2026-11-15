import colors from '@/constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

export default function MinhasPlantasPage() {
  const [plantas, setPlantas] = useState<any[]>([]);

 useFocusEffect(
  React.useCallback(() => {
    carregarPlantas();
  }, [])
);

  async function carregarPlantas() {
    try {
      const response = await fetch(
        "http://192.168.0.178:8000/api/plantas/"
        );

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
          🌱 Minhas Plantas
        </Text>

        <Text
            onPress={() =>
            router.push('/(panel)/profile/page')
            }
            style={{
                marginTop: 10,
                color: '#E8F5E9',
                fontWeight: '700',
                fontSize: 16,
            }}
            >
            ← Voltar para Perfil
            </Text>
      </View>

      

      <ScrollView
        contentContainerStyle={{
          padding: 16,
        }}
      >
        <Text
          style={{
            color: '#666',
            marginBottom: 12,
          }}
        >
        Total de plantas: {
            plantas.filter((planta) => planta.imagem).length
        }
        </Text>

        {plantas
          .filter((planta) => planta.imagem)
          .map((planta) => (
            <Pressable
                key={planta.id_planta}
                onPress={() =>
                    router.push({
                    pathname: '/(panel)/minhas-plantas/[id]/page',
                    params: {
                        id: planta.id_planta,
                    },
                    })
                }
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#E5E5E5',
                    borderLeftWidth: 5,
                    borderLeftColor: colors.green,
                    elevation: 2,
                }}
                >
              <Image
                source={{ uri: planta.imagem }}
                style={{
                  width: '100%',
                  height: 220,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.darkGreen,
                  marginTop: 8,
                }}
              >
                {planta.nome_popular}
              </Text>

              {planta.tipo ? (
                <Text
                  style={{
                    color: '#666',
                    marginTop: 4,
                  }}
                >
                  Tipo: {planta.tipo}
                </Text>
              ) : null}

              {planta.origem ? (
                <Text
                  style={{
                    color: '#666',
                    marginTop: 2,
                  }}
                >
                  Origem: {planta.origem}
                </Text>
              ) : null}
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}