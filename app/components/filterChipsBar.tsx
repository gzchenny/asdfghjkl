import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';

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
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9', 
    paddingVertical: 6,
  },
  row: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#ffd33d',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    color: '#25292e',
    fontWeight: '500',
  },
});