import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Reconstructed from the Stitch export's centauri_logo/code.html (inline SVG)
// using its exact colors and composition — dark tile, solid blue orbit ring,
// dashed rose orbit ring, a 4-point star mark, and a rose planet dot — since
// rasterizing that SVG in this environment (qlmanage) produced a broken,
// mis-scaled render rather than a faithful copy of the source art.
const TILE_BG = '#090E1F';
const RING_BLUE = '#38BDF8';
const RING_ROSE = '#F43F5E';
const STAR_COLOR = '#F0F6FC';

export default function CentauriMark({ size = 72 }) {
  const styles = createStyles(size);

  return (
    <View style={styles.tile}>
      <View style={styles.dashedRing} />
      <View style={styles.solidRing} />
      <Text style={styles.star}>✦</Text>
      <View style={styles.dot} />
    </View>
  );
}

const createStyles = (size) => StyleSheet.create({
  tile: {
    width: size,
    height: size,
    borderRadius: size * 0.25,
    backgroundColor: TILE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  solidRing: {
    position: 'absolute',
    width: size * 0.78,
    height: size * 0.78,
    borderRadius: size * 0.39,
    borderWidth: 1.5,
    borderColor: RING_BLUE,
    opacity: 0.85,
    transform: [{ scaleY: 0.42 }, { rotate: '-28deg' }],
  },
  dashedRing: {
    position: 'absolute',
    width: size * 0.72,
    height: size * 0.72,
    borderRadius: size * 0.36,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: RING_ROSE,
    opacity: 0.55,
  },
  star: {
    color: STAR_COLOR,
    fontSize: size * 0.42,
    lineHeight: size * 0.46,
  },
  dot: {
    position: 'absolute',
    top: size * 0.24,
    right: size * 0.22,
    width: size * 0.09,
    height: size * 0.09,
    borderRadius: size * 0.045,
    backgroundColor: RING_ROSE,
  },
});
