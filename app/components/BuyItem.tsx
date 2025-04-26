import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

interface BuyItemProps {
  itemName: string;
  itemCost: number;
  onConfirm: (itemName: string, quantity: number, totalCost: number) => void;
}

export default function BuyItem({
  itemName,
  itemCost,
  onConfirm,
}: BuyItemProps) {
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
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const totalCost = quantity * itemCost; // Dynamically calculate total cost

  return (
    <View style={styles.container}>
      <Text style={styles.itemName}>{itemName}</Text>
      <Text style={styles.itemCost}>Cost per item: ${itemCost.toFixed(2)}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={decreaseQuantity}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity.toString()}
          onChangeText={(text) => setQuantity(Number(text))}
        />
        <TouchableOpacity
          onPress={increaseQuantity}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.totalCost}>Total Cost: ${totalCost.toFixed(2)}</Text>
      <Button title="Buy" onPress={handleConfirm} color="#ffd33d" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#25292e",
    borderRadius: 10,
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  itemCost: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: "#ffd33d",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#25292e",
    fontWeight: "bold",
  },
  input: {
    width: 60,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
  },
  totalCost: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
  },
});
