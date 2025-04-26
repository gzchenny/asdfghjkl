import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  checkout: () => Promise<{ totalItems: number; totalPrice: number }>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  checkout: async () => ({ totalItems: 0, totalPrice: 0 }),
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = getAuth();

  // Load cart data on component mount and auth state change
  // Update the loadCartData and saveCartData functions:

  // Load cart data on component mount and auth state change
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const user = auth.currentUser;

        // For authenticated users, load cart from user document
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists() && userDoc.data().cart) {
            const cartItems = userDoc.data().cart;
            setCart(cartItems);
            console.log(
              "Loaded cart from user document:",
              cartItems.length,
              "items"
            );

            // Also update local storage as backup
            await AsyncStorage.setItem("cartItems", JSON.stringify(cartItems));
            setIsLoaded(true);
            return;
          }
        }

        // Fall back to AsyncStorage for all users
        const storedCart = await AsyncStorage.getItem("cartItems");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
          console.log(
            "Loaded cart from AsyncStorage:",
            parsedCart.length,
            "items"
          );

          // If user is authenticated, sync AsyncStorage to user document
          if (user) {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { cart: parsedCart });
          }
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    // Initial load
    loadCartData();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadCartData();
    });

    return () => unsubscribe();
  }, []);

  // Save cart data whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const saveCartData = async () => {
      try {
        // Always save to AsyncStorage for all users
        await AsyncStorage.setItem("cartItems", JSON.stringify(cart));
        console.log("Saved cart to AsyncStorage:", cart.length, "items");

        // If user is authenticated, also save to user document
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { cart: cart });
          console.log("Saved cart to user document:", cart.length, "items");
        }
      } catch (error) {
        console.error("Error saving cart data:", error);
      }
    };

    saveCartData();
  }, [cart, isLoaded]);

  const addToCart = async (item: CartItem) => {
    try {
      setCart((prev) => {
        const existingItem = prev.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          return prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        } else {
          console.log("Adding new item to cart:", item.itemName);
          return [...prev, item];
        }
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Update the clearCart function:

  const clearCart = async () => {
    try {
      setCart([]);

      // Clear from AsyncStorage
      await AsyncStorage.removeItem("cartItems");

      // Clear from user document if user is authenticated
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { cart: [] });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const checkout = async () => {
    try {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order record if user is authenticated
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          items: [...cart], // Make a copy to ensure we store the current state
          totalItems,
          totalPrice,
          status: "processing",
          createdAt: new Date(),
        });
      }

      // Clear cart after successful checkout
      await clearCart();

      return { totalItems, totalPrice };
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error; // Rethrow to handle in UI
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
};
