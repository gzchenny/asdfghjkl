import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'stretch',
  },
  productName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1c2f2e",
    marginBottom: 8,
  },
  farmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  farmName: {
    fontSize: 15,
    color: "#444",
  },
  messageButton: {
    fontSize: 13,
    color: "#234930",
    fontWeight: "500",
  },
  date: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f1e8",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  quantityControl: {
    fontSize: 16,
    color: "#234930",
    fontWeight: "600",
    paddingHorizontal: 5,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "500",
    color: "#234930",
    width: 25,
    textAlign: "center",
  },
  orderButton: {
    backgroundColor: "#234930",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  orderButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  orderSummary: {
    marginBottom: 4,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#234930",
    textAlign: "right",
  },
});
