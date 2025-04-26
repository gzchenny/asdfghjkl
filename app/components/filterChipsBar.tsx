import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onFilterPress: (type: string) => void;
};

const FILTERS = ['Crop', 'Location', 'Price'];

export default function FilterChipsBar({ onFilterPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => onFilterPress(f.toLowerCase())}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{f} ▾</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff', 
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 14,
    color: '#1E4035',
    fontWeight: '600',
  },
});