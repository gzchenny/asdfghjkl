import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "./components/cartcontext";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function CartPage() {
  const { cart: contextCart, removeFromCart, clearCart, checkout } = useCart();
  const [cart, setCart] = useState(contextCart);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchCartFromFirestore = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setCart(contextCart);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().cart) {
          const firestoreCart = userDoc.data().cart;
          console.log(
            "Loaded cart from Firestore:",
            firestoreCart.length,
            "items"
          );
          setCart(firestoreCart);
        } else {
          console.log("No cart data in Firestore, using context cart");
          setCart(contextCart);
        }
      } catch (error) {
        console.error("Error fetching cart from Firestore:", error);
        setCart(contextCart);
      } finally {
        setLoading(false);
      }
    };

    fetchCartFromFirestore();
  }, [contextCart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handleRemoveItem = async (id) => {
    try {
      removeFromCart(id);

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().cart) {
          const updatedCart = userDoc
            .data()
            .cart.filter((item) => item.id !== id);
          await updateDoc(userRef, { cart: updatedCart });
        }
      }

      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Could not remove item from cart");
    }
  };

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      Alert.alert("Login Required", "Please login to complete your purchase");
      router.push("/auth/signIn");
      return;
    }

    try {
      setCheckoutLoading(true);

      const user = auth.currentUser;

      const newOrder = {
        orderId: Date.now().toString(),
        items: [...cart],
        totalItems,
        totalPrice,
        status: "processing",
        createdAt: new Date(),
      };

      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        ...newOrder,
      });

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentOrders = userDoc.data().orders || [];

        await updateDoc(userRef, {
          cart: [],
          orders: [
            ...currentOrders,
            {
              ...newOrder,
              orderId: orderRef.id,
            },
          ],
        });

        console.log("Order added to user document:", orderRef.id);
      } else {
        console.error("User document not found");
      }

      await clearCart();

      setCart([]);

      Alert.alert(
        "Purchase Complete",
        `You purchased ${totalItems} item(s) for $${totalPrice.toFixed(2)}!`,
        [{ text: "OK", onPress: () => router.push("/(tabs)") }]
      );
    } catch (error) {
      console.error("Checkout failed:", error);
      Alert.alert("Error", "There was a problem processing your order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
          {cart.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>Continue Shopping</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E4035" />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        ) : checkoutLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E4035" />
            <Text style={styles.loadingText}>Processing your order...</Text>
          </View>
        ) : cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#ccc" />
            <Text style={styles.empty}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.backButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.itemCount}>{totalItems} item(s) in cart</Text>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View>
                  <Text style={styles.itemName}>
                    {item.itemName} × {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${item.price.toFixed(2)} each
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Text style={styles.total}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Ionicons name="trash-outline" size={22} color="#cc0000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  ${totalPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery:</Text>
                <Text style={styles.summaryValue}>$0.00</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.checkoutContainer}>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.checkoutText}>
                  Checkout (${totalPrice.toFixed(2)})
                </Text>
              </TouchableOpacity>
            </View>
          </>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  continueButton: {
    padding: 8,
  },
  continueText: {
    color: "#1E4035",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  empty: {
    color: "#777",
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1E4035",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  itemCount: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    alignItems: "flex-end",
    gap: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E4035",
  },
  summarySection: {
    marginTop: 30,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E4035",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  checkoutContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  checkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
