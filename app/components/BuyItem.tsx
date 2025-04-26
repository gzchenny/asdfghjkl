import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

interface BuyItemProps {
  itemName: string;
  itemCost: number;
  onConfirm: (itemName: string, quantity: number, totalCost: number) => void;
}

export default function BuyItem({ itemName, itemCost, onConfirm }: BuyItemProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleConfirm = () => {
    if (quantity <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }

    const totalCost = quantity * itemCost;
    onConfirm(itemName, quantity, totalCost);
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const totalCost = quantity * itemCost;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cost per unit: ${itemCost.toFixed(2)}</Text>

      <View style={styles.quantityRow}>
        <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity.toString()}
          onChangeText={(text) => {
            const parsed = parseInt(text);
            setQuantity(isNaN(parsed) ? 1 : parsed);
          }}
        />

        <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>Total Cost: ${totalCost.toFixed(2)}</Text>

      <TouchableOpacity onPress={handleConfirm} style={styles.buyButton}>
        <Text style={styles.buyText}>BUY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#25292e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 6,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#ffd33d",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  input: {
    width: 50,
    height: 36,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    textAlign: "center",
    fontSize: 16,
  },
  total: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#ffd33d",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
});
