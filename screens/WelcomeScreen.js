import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, CentauriMark, LanguageToggleButton, ThemeToggleButton } from '../components';
import { useTheme } from '../theme';

const ORBIT_DURATION_MS = 4500;
const ORBIT_SIZE = 128;
const RING_SIZE = 100;
const CORE_SIZE = 30;
const DOT_SIZE = 10;

// Each dot spins a full 360° around a pivot the size of the ring, with the
// dot pinned to the pivot's top edge — rotating the pivot sweeps the dot
// around the circle. A 360° rotation is visually identical to 0°, so the
// loop boundary is seamless (unlike a hand-built cos/sin keyframe table).
const ORBIT_DOTS = [
  { color: 'error', phaseDeg: 0 },
  { color: 'accent', phaseDeg: 180 },
];

// Faint static starfield scattered around the orbit ring, positioned in
// pixels within the ORBIT_SIZE square (see markup below).
const STARS = [
  { top: 2, left: 16, size: 2, opacity: 0.7 },
  { top: 96, left: 6, size: 2, opacity: 0.5 },
  { top: 8, left: 108, size: 2, opacity: 0.55 },
  { top: 110, left: 100, size: 2, opacity: 0.4 },
  { top: 56, left: 0, size: 2, opacity: 0.5 },
  { top: 40, left: 120, size: 2, opacity: 0.45 },
];

const FEATURE_CONFIG = [
  { icon: 'grid-outline', titleKey: 'feature1Title', descriptionKey: 'feature1Description' },
  { icon: 'alert-circle-outline', titleKey: 'feature2Title', badgeKey: 'feature2Badge', descriptionKey: 'feature2Description' },
  { icon: 'radio-outline', titleKey: 'feature3Title', descriptionKey: 'feature3Description' },
];

export default function WelcomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isActive = true;
    let currentAnimation = null;

    // Animated.loop's native-driver path (_startNativeLoop) doesn't reset
    // cleanly between iterations on this RN version — it produces a visible
    // jump instead of a seamless loop. Driving the loop manually (explicit
    // reset to 0, then a fresh 0→1 run each time the previous one finishes)
    // sidesteps that and gives a genuinely continuous spin.
    const animate = () => {
      if (!isActive) {
        return;
      }

      progress.setValue(0);
      currentAnimation = Animated.timing(progress, {
        toValue: 1,
        duration: ORBIT_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      currentAnimation.start(({ finished }) => {
        if (finished && isActive) {
          animate();
        }
      });
    };

    animate();

    return () => {
      isActive = false;
      currentAnimation?.stop();
    };
  }, [progress]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.telemetryRow}>
          <View style={styles.chip}>
            <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            <AppText color="textMuted" variant="labelSm">{t('welcome.telemetry')}</AppText>
          </View>
          <View style={styles.telemetryRight}>
            <AppText color="textMuted" variant="labelSm">{t('welcome.sector')}</AppText>
            <LanguageToggleButton />
            <ThemeToggleButton />
          </View>
        </View>

        <View style={styles.markRow}>
          <CentauriMark />
        </View>

        <View style={styles.orbitBadge}>
          {STARS.map((star, index) => (
            <View
              key={index}
              style={[
                styles.orbitStar,
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  opacity: star.opacity,
                  backgroundColor: theme.colors.onSurfaceVariant,
                },
              ]}
            />
          ))}
          <View style={styles.orbitRing} />
          <View style={[styles.core, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Ionicons color={theme.colors.accent} name="sunny" size={18} />
          </View>
          {ORBIT_DOTS.map((item) => {
            const rotate = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [`${item.phaseDeg}deg`, `${item.phaseDeg + 360}deg`],
            });

            return (
              <Animated.View
                key={item.color}
                style={[styles.orbitPivot, { transform: [{ rotate }] }]}
              >
                <View style={[styles.orbitDot, { backgroundColor: theme.colors[item.color] }]} />
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.orbitCaption}>
          <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
          <AppText color="accent" variant="labelSm">{t('welcome.orbitStable')}</AppText>
        </View>

        <View style={styles.brandRow}>
          <AppText variant="headlineMd" weight="bold">{t('welcome.brand')}</AppText>
          <View style={styles.brandBadge}>
            <AppText color="accent" variant="labelSm">{t('welcome.brandBadge')}</AppText>
          </View>
        </View>

        <AppText align="center" variant="displayLg" weight="bold">
          {t('welcome.headlineLine1')}{'\n'}
          <AppText color="primary" variant="displayLg" weight="bold">{t('welcome.headlineLine2')}</AppText>
        </AppText>

        <AppText align="center" color="textMuted" style={styles.subtitle} variant="bodyLg">
          {t('welcome.subtitle')}
        </AppText>

        <View style={styles.features}>
          {FEATURE_CONFIG.map((feature) => (
            <View key={feature.titleKey} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                <Ionicons color={theme.colors.accent} name={feature.icon} size={18} />
              </View>
              <View style={styles.featureText}>
                <View style={styles.featureTitleRow}>
                  <AppText numberOfLines={1} style={styles.featureTitle} variant="bodyMd" weight="semiBold">
                    {t(`welcome.${feature.titleKey}`)}
                  </AppText>
                  {feature.badgeKey ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}>
                      <AppText color="error" variant="labelSm">{t(`welcome.${feature.badgeKey}`)}</AppText>
                    </View>
                  ) : null}
                </View>
                <AppText color="textMuted" variant="bodySm">{t(`welcome.${feature.descriptionKey}`)}</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
          rightIcon={<Ionicons color={theme.colors.onPrimary} name="arrow-forward" size={18} />}
          title={t('welcome.cta')}
        />
        <View style={styles.loginRow}>
          <AppText color="textMuted" variant="bodySm">{t('welcome.hasAccount')}</AppText>
          <AppText color="accent" onPress={() => navigation.navigate('Login')} variant="bodySm" weight="semiBold">
            {t('welcome.login')}
          </AppText>
        </View>
        <AppText align="center" color="textMuted" style={styles.secureNote} variant="bodySm">
          {t('welcome.secureNote')}
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  telemetryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    rowGap: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
  },
  telemetryRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  markRow: {
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  orbitBadge: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -theme.spacing.sm,
  },
  orbitStar: {
    position: 'absolute',
  },
  orbitRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  brandBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  subtitle: {
    marginTop: -theme.spacing.xs,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitPivot: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
  },
  orbitDot: {
    marginTop: -DOT_SIZE / 2,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  orbitCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: -theme.spacing.sm,
  },
  features: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceContainer,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  featureTitle: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  loginRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  secureNote: {
    marginTop: theme.spacing.xs,
  },
});
