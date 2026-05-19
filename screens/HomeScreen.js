import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { createAuthScreenStyles } from './authScreenStyles';

export default function HomeScreen() {
  const { expiresAt, logout, user } = useAuth();
  const { theme } = useTheme();
  const styles = createAuthScreenStyles(theme);
  const expiresDate = expiresAt ? new Date(expiresAt).toLocaleString() : 'Sin expiracion';

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>Sesion activa</Text>
        <Text style={styles.title}>Hola, {user.name}</Text>
        <Text style={styles.subtitle}>{user.email || 'Usuario autenticado con JWT'}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>JWT validado</Text>
          <Text style={styles.statusText}>La sesion expira: {expiresDate}</Text>
        </View>

        <Button fullWidth onPress={logout} title="Cerrar sesion" variant="outline" />
      </View>
    </View>
  );
}
