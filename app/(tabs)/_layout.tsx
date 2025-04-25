import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import SignIn from "../auth/signIn";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function AppLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.profileCompleted) {
              setFirstName(userData.firstName || "User");
              setIsSignedIn(true);
            } else {
              router.replace("/auth/profile");
            }
          } else {
            setIsSignedIn(false);
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          setIsSignedIn(false);
        }
      } else {
        setIsSignedIn(false);
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
          backgroundColor: "#25292e",
        }}
      >
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <SignIn onSignIn={() => setIsSignedIn(true)} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
        headerRight: () => (
          <Text style={{ color: "#fff", marginRight: 10, fontSize: 16 }}>
            {firstName}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buyPage"
        options={{
          title: "Buy",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sellPage"
        options={{
          title: "Sell",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "storefront" : "storefront-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
