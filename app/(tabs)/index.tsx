import React, { useState, useEffect } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import BuyItem from "../components/BuyItem";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    firstName?: string;
    lastName?: string;
    gender?: string;
    location?: string;
  } | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error("User data not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, color: "#333" }}>
          No user data available. Please sign in.
        </Text>
      </View>
    );
  }

  function handleConfirm(itemName: string, quantity: number, totalCost: number): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Welcome, {userData.firstName}!
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 5 }}>
        Gender: {userData.gender}
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 5 }}>
        Location: {userData.location}
      </Text>
      <Text style={{ fontSize: 48, marginBottom: 50, marginTop: 50 }}>
        TESTING COMPONENTS
      </Text>
      <BuyItem itemName="Item A" itemCost={5.99} onConfirm={handleConfirm} />
    </View>
  );
}
