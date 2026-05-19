import React, { useState } from 'react';
import { Text, TextInput, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { createAuthScreenStyles } from './authScreenStyles';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const { theme } = useTheme();
  const styles = createAuthScreenStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      await login({ email, password });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.headText}>Centauri</Text>
      <View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button fullWidth loading={loading} onPress={handleLogin} title="Entrar" />
      </View>
    </SafeAreaView>
  );
}
