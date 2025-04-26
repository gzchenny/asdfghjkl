import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../components/cartcontext";

export default function CartPage() {
    const { cart, removeFromCart, clearCart, checkout } = useCart();


  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>

        {cart.length === 0 ? (
          <Text style={styles.empty}>Your cart is empty.</Text>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View>
                <Text style={styles.itemName}>
                  {item.itemName} x {item.quantity}
                </Text>
                <Text style={styles.itemPrice}>
                  ${item.price.toFixed(2)} each
                </Text>
              </View>
              <View style={styles.actions}>
                <Text style={styles.total}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#cc0000" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {cart.length > 0 && (
        <View style={styles.checkoutContainer}>
            <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
                const { totalItems, totalPrice } = checkout();
                alert(`✅ You purchased ${totalItems} item(s) for $${totalPrice.toFixed(2)}!`);
                clearCart();
            }}
            >
            <Text style={styles.checkoutText}>Checkout (${checkout().totalPrice.toFixed(2)})</Text>
            </TouchableOpacity>
        </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  empty: {
    color: "#777",
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  actions: {
    alignItems: "flex-end",
    gap: 6,
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E4035",
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: "#cc0000",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  clearText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutContainer: {
    marginTop: 20,
    padding: 20,
  },
  
  checkoutButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  
  checkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  
});
