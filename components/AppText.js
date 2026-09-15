import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';

import { useTheme } from '../theme';

const headingWeights = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

const bodyWeights = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  bold: 'Geist_600SemiBold',
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
  const isHeadingVariant = typographyStyle.fontFamily?.startsWith('SpaceGrotesk');
  const fontFamily = weight ? (isHeadingVariant ? headingWeights : bodyWeights)[weight] : null;

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
