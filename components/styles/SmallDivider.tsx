import React from 'react';
import { View, StyleSheet } from 'react-native';

const SmallDivider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
});

export default SmallDivider;
