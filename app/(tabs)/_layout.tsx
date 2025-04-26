import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Modal from "react-native-modal";

export default function AppLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("Profile");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profileCompleted) {
            setFirstName(userData.firstName || "User");
            setProfilePicUrl(userData.profilePicUrl || null);
            setIsSignedIn(true);
          } else {
            router.replace("/auth/profile");
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/signIn");
    } catch (err) {
      Alert.alert("Error signing out");
    }
  };

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitleAlign: "left",
          headerTitle: () => <LogoTitle />,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 16 }}>
              <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                {profilePicUrl ? (
                  <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
                ) : (
                  <Text style={styles.profileName}>{firstName} </Text>
                )}
              </TouchableOpacity>
              <Modal
                isVisible={dropdownVisible}
                onBackdropPress={() => setDropdownVisible(false)}
                style={styles.modal}
              >
                <View style={styles.dropdown}>
                  <Pressable
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push("/auth/profile");
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>Edit Profile</Text>
                  </Pressable>
                  <Pressable onPress={handleSignOut} style={styles.dropdownItem}>
                    <Text style={[styles.dropdownText, { color: "#cc0000" }]}>Sign Out</Text>
                  </Pressable>
                </View>
              </Modal>
            </View>
          ),
          headerStyle: { backgroundColor: "#FFFFFF" },
          tabBarStyle: { backgroundColor: "#F5F5F5" },
          tabBarActiveTintColor: "#1E4035",
          tabBarInactiveTintColor: "#888",
          tabBarIcon: ({ color, focused }) => {
            let iconName;
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
                iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
                break;
              default:
                iconName = "ellipse";
            }
            return <Ionicons name={iconName as any} size={24} color={color} />;
          },
          tabBarLabel:
            route.name === "buyPage"
              ? "Buy"
              : route.name === "sellPage"
              ? "Sell"
              : route.name === "messages"
              ? "Messages"
              : "Home",
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="buyPage" />
        <Tabs.Screen name="sellPage" />
        <Tabs.Screen name="messages" />
      </Tabs>
    </>
  );
}

const LogoTitle = () => (
  <View style={styles.logoContainer}>
    <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
    <Text style={styles.logoText}>crop</Text>
  </View>
);

const styles = StyleSheet.create({
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
  profileName: {
    color: "#1E4035",
    fontWeight: "600",
    fontSize: 16,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: "cover",
  },
  modal: {
    margin: 0,
    position: "absolute",
    top: 50,
    right: 10,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdown: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1E4035",
  },
});
