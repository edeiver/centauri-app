import React, { forwardRef, useState } from 'react';
import { Image, StyleSheet, TextInput as RNTextInput, View } from 'react-native';

import { useTheme } from '../theme';
import AppText from './AppText';

const inputVariants = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  success: 'success',
  danger: 'error',
  neutral: 'borderStrong',
};

function getColor(theme, color) {
  return theme.colors[color] || color;
}

function getVariantColor(theme, variant) {
  const colorKey = inputVariants[variant] || inputVariants.primary;
  return getColor(theme, colorKey);
}

function InputAdornment({ icon, image, imageStyle, style }) {
  if (icon) {
    return <View style={styles.icon}>{icon}</View>;
  }

  if (image) {
    return <Image source={image} style={[styles.image, style, imageStyle]} />;
  }

  return null;
}

const AppTextInput = forwardRef(function AppTextInput({
  label,
  labelRight,
  helperText,
  error,
  variant = 'primary',
  highlightColor,
  highlightOnFocus = true,
  disabled = false,
  leftIcon,
  rightIcon,
  leftImage,
  rightImage,
  imageStyle,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  onFocus,
  onBlur,
  ...inputProps
}, ref) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const activeColor = getColor(theme, highlightColor) || getVariantColor(theme, variant);
  const hasError = Boolean(error);
  const dynamicStyles = createDynamicStyles(theme, {
    activeColor,
    disabled,
    focused,
    hasError,
    highlightOnFocus,
  });

  const handleFocus = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={[styles.container, dynamicStyles.container, containerStyle]}>
      {label || labelRight ? (
        <View style={styles.labelRow}>
          {label ? (
            <AppText color="text" style={labelStyle} variant="bodySm" weight="medium">
              {label}
            </AppText>
          ) : null}
          {labelRight}
        </View>
      ) : null}

      <View
        style={[styles.inputContainer, dynamicStyles.inputContainer, inputContainerStyle]}
      >
        <InputAdornment
          icon={leftIcon}
          image={leftImage}
          imageStyle={imageStyle}
          style={dynamicStyles.image}
        />

        <RNTextInput
          editable={!disabled}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={theme.colors.textMuted}
          ref={ref}
          style={[styles.input, dynamicStyles.input, inputStyle]}
          {...inputProps}
        />

        <InputAdornment
          icon={rightIcon}
          image={rightImage}
          imageStyle={imageStyle}
          style={dynamicStyles.image}
        />
      </View>

      {error || helperText ? (
        <AppText
          color={hasError ? 'error' : 'textMuted'}
          style={helperTextStyle}
          variant="bodySm"
        >
          {error || helperText}
        </AppText>
      ) : null}
    </View>
  );
});

export default AppTextInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 2,
  },
  inputContainer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 46,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
});

function createDynamicStyles(theme, {
  activeColor,
  disabled,
  focused,
  hasError,
  highlightOnFocus,
}) {
  const shouldHighlight = focused && highlightOnFocus && !disabled && !hasError;

  return StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    inputContainer: {
      gap: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      // Only borderColor reacts to focus here. RN's New Architecture has a
      // confirmed regression (facebook/react-native#45798) where toggling
      // shadowColor/elevation on a View wrapping a focused TextInput fires
      // an immediate spurious blur — so those props must stay static.
      borderColor: hasError
        ? theme.colors.error
        : shouldHighlight
          ? activeColor
          : theme.colors.border,
      backgroundColor: disabled ? theme.colors.surfaceContainer : theme.colors.surface,
      opacity: disabled ? 0.65 : 1,
    },
    input: {
      ...theme.typography.bodyMd,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.text,
    },
    image: {
      width: theme.spacing.lg,
      height: theme.spacing.lg,
    },
  });
}
