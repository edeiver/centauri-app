import React from 'react';

import { PlaceholderScreen } from '../components';

export default function PinSetupScreen({ navigation }) {
  return (
    <PlaceholderScreen
      actionLabel="Volver"
      eyebrow="Órbita segura"
      onAction={() => navigation.goBack()}
      subtitle="El PIN local todavía no tiene un endpoint de respaldo definido en el backend — pendiente de confirmar el enfoque antes de construir esta pantalla."
      title="Crea tu Clave Orbital"
    />
  );
}
