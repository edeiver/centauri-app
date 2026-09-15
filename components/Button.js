import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';

const buttonSizes = {
  sm: {
    minHeight: 40,
    paddingHorizontal: 'md',
    textStyle: 'bodySm',
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 'lg',
    textStyle: 'bodyMd',
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: 'xl',
    textStyle: 'bodyLg',
  },
};

function getVariantStyles(theme, variant) {
  const variants = {
    primary: {
      button: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      text: {
        color: theme.colors.onPrimary,
      },
      loaderColor: theme.colors.onPrimary,
    },
    secondary: {
      button: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
      },
      text: {
        color: theme.colors.onSecondary,
      },
      loaderColor: theme.colors.onSecondary,
    },
    outline: {
      button: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.borderStrong,
      },
      text: {
        color: theme.colors.text,
      },
      loaderColor: theme.colors.text,
    },
    ghost: {
      button: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      text: {
        color: theme.colors.text,
      },
      loaderColor: theme.colors.text,
    },
    danger: {
      button: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
      text: {
        color: theme.colors.onError,
      },
      loaderColor: theme.colors.onError,
    },
  };

  return variants[variant] || variants.primary;
}

export default function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
  ...pressableProps
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const sizeConfig = buttonSizes[size] || buttonSizes.md;
  const variantStyles = getVariantStyles(theme, variant);
  const isDisabled = disabled || loading;
  const content = children || title;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: sizeConfig.minHeight,
          paddingHorizontal: theme.spacing[sizeConfig.paddingHorizontal],
        },
        variantStyles.button,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variantStyles.loaderColor} />
        ) : (
          <>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text
              numberOfLines={1}
              style={[
                styles.text,
                theme.typography[sizeConfig.textStyle],
                variantStyles.text,
                textStyle,
              ]}
            >
              {content}
            </Text>
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const createStyles = (theme) => StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textAlign: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
});
