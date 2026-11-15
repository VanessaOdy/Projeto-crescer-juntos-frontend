import colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function PanelLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      {/* TABS VISÍVEIS */}
      <Tabs.Screen
        name="home/page"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/page"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="trocas/page"
  options={{
    title: 'Trocas',
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons
        name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'}
        size={size}
        color={color}
      />
    ),
  }}
/>


      {/* ROTAS OCULTAS */}
      <Tabs.Screen name="direct/list" options={{ href: null }} />
      <Tabs.Screen name="direct/[id]" options={{ href: null }} />

      <Tabs.Screen name="plant/new/page" options={{ href: null }} />
      <Tabs.Screen name="plant/[id]/page" options={{ href: null }} />

      <Tabs.Screen  name="minhas-plantas/page"  options={{href: null }} />
      <Tabs.Screen name="minhas-plantas/[id]/page"options={{ href: null }} />

      {/* Novo: Perfil de terceiros e avaliações por usuário (ocultos) */}
      <Tabs.Screen name="ratings/[id]" options={{ href: null }} />
    </Tabs>
  );
}
