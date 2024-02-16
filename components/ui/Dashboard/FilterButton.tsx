// FilterButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FilterLabels, QuotationStatusKey } from '../../../models/QuotationStatus'; // Adjust the import path as necessary

type FilterButtonProps = {
    filter: QuotationStatusKey;
    isActive: boolean;
    onPress: () => void;
  };

export const FilterButton: React.FC<FilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = FilterLabels[filter];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{displayText}</Text>
      </TouchableOpacity>
    );
  };

// Define styles for your FilterButton here
const styles = StyleSheet.create({
    filterButton: {
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 20,
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        height: 40,
      },
      activeFilter: {
        // backgroundColor:'#1b72e8',
        backgroundColor: '#1f303cff',
        color: 'white',
      },
});
