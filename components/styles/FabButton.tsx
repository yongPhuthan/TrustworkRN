import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FabButton = () => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleExpand}>
        <Icon name="plus" size={24} color="white" style={styles.icon} />
        <Text style={styles.text}>เสนอราคาลูกค้าใหม่</Text>
      </TouchableOpacity>
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  button: {
    backgroundColor: '#0073BA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    flexDirection: 'row',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600'
  },
  icon: {
    marginRight: 8,
  },
  secondaryContainer: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    alignItems: 'flex-end',
  },
  secondary: {
    backgroundColor: 'white',
    width: '100%',
    elevation: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  secondaryButton: {
    padding: 10,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 16,
    color: 'black',
  },
});

export default FabButton;
