import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import BuyItem from "../components/BuyItem";
import BuyerDashboard from "../components/buyerdash";

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
        }}>
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
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back, {userData.firstName}.</Text>
        <Text style={styles.subText}>Your product is on the way!</Text>
      </View>
      <BuyerDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',      
    alignItems: 'flex-start',     
    backgroundColor: '#fff',
    paddingTop: 16,               
    paddingHorizontal: 16,
  },

  welcomeContainer: {
    alignSelf: 'stretch',         
    backgroundColor: 'transparent',
    marginBottom: 10, 
    marginLeft: 20,            
  },
  welcomeText: {
    color: '#727272',
    fontSize: 24,
    marginBottom: 0,
  },
  subText: {
    color: '#1E4035',
    fontSize: 26,
    marginBottom: 0,
  },

  content: {
    alignSelf: 'stretch',
  },
});
