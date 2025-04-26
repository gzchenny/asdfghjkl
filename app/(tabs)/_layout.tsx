import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import SignIn from "../auth/signIn";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { CartProvider } from "../components/cartcontext";

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
            router.replace("/auth/signIn");
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          setIsSignedIn(false);
          router.replace("/auth/signIn");
        }
      } else {
        setIsSignedIn(false);
        router.replace("/auth/signIn");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E4035" />
      </View>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <CartProvider>
      {" "}
      {}
      <Tabs
        screenOptions={({ route }: { route: { name: string } }) => ({
          headerShown: true,
          headerTitleAlign: "left",
          headerTitle: () => <LogoTitle />,
          headerTintColor: "#fff",
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: "#F5F5F5",
          },
          tabBarActiveTintColor: "#1E4035",
          tabBarInactiveTintColor: "#888",
          headerStyle: { backgroundColor: "#FFFFFF" },
          tabBarIcon: ({ color, focused }) => {
            let iconName: typeof Ionicons.defaultProps.name;
            switch (route.name) {
              case "index":
                iconName = focused ? "home" : "home-outline";
                break;
              case "buyPage":
                iconName = focused ? "cash" : "cash-outline";
                break;
              case "sellPage":
                iconName = focused ? "storefront" : "storefront-outline";
                break;
              case "messages":
                iconName = focused
                  ? "chatbubble-ellipses"
                  : "chatbubble-ellipses-outline";
                break;
              default:
                iconName = "ellipse";
            }
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarLabel:
            route.name === "buyPage"
              ? "Buy"
              : route.name === "sellPage"
              ? "Sell"
              : route.name === "messages"
              ? "Messages"
              : route.name === "index"
              ? "Home"
              : "Home",
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="buyPage" />
        <Tabs.Screen name="sellPage" />
        <Tabs.Screen name="messages" />
      </Tabs>
    </CartProvider>
  );
}

const LogoTitle = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require("../../assets/images/logo.png")}
      style={styles.logo}
    />
    <Text style={styles.logoText}>crop</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E4035",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
