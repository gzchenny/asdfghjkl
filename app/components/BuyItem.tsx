import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

interface BuyItemProps {
  productName: string;
  farmName: string;
  date?: string;
  initialQuantity?: number;
  pricePerItem: number;
  onConfirm: (productName: string, quantity: number, totalCost: number) => void;
  onMessagePress?: () => void;
}

export default function BuyItem({
  productName,
  farmName,
  date,
  initialQuantity = 1,
  onConfirm,
  onMessagePress,
  pricePerItem,
}: BuyItemProps) {
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const formattedDate = date || "April 26, 2025";
  const totalPrice = (pricePerItem * quantity).toFixed(2);

  const handleConfirm = () => {
    if (quantity <= 0) return;

    const totalCost = pricePerItem * quantity;
    onConfirm(productName, quantity, totalCost);

    setQuantity(initialQuantity);
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <View style={styles.container}>
      <View style={styles.orderSummary}>
        <Text style={styles.totalText}>Total: ${totalPrice}</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.quantityPill}>
          <TouchableOpacity
            onPress={decreaseQuantity}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.quantityControl}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{quantity}</Text>

          <TouchableOpacity
            onPress={increaseQuantity}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.quantityControl}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.orderButton} onPress={handleConfirm}>
          <Text style={styles.orderButtonText}>Crop It!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  orderSummary: {
    marginBottom: 8,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E4035",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "left",
    justifyContent: "space-between",
  },
  quantityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityControl: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4035",
    paddingHorizontal: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
  },
  orderButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  orderButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
