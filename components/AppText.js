import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';

import { useTheme } from '../theme';

const fontWeights = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
  light: 'Roboto_300Light',
};

export default function AppText({
  children,
  variant = 'bodyMd',
  weight,
  color = 'text',
  align = 'left',
  numberOfLines,
  style,
  ...textProps
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const typographyStyle = theme.typography[variant] || theme.typography.bodyMd;
  const colorValue = theme.colors[color] || color || theme.colors.text;
  const fontFamily = weight ? fontWeights[weight] : null;

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        typographyStyle,
        { color: colorValue, textAlign: align },
        fontFamily && { fontFamily },
        style,
      ]}
      {...textProps}
    >
      {children}
    </RNText>
  );
}

const createStyles = (theme) => StyleSheet.create({
  base: {
    color: theme.colors.text,
  },
});
