import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
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

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitle: () => <LogoTitle />,
        headerTintColor: '#fff',
        headerShadowVisible: false,
        scenecontainerStyle: {backgroundcolor: '#FFFFFF'},
        tabBarStyle: {
          backgroundColor: '#F5F5F5',
        },
        
        tabBarActiveTintColor: '#1E4035',
        tabBarInactiveTintColor: '#888',
        headerStyle: { backgroundColor: '#FFFFFF' },
        tabBarIcon: ({ color, focused }) => {
          let iconName: string;
          switch (route.name) {
            case 'index':    iconName = focused ? 'home'           : 'home-outline';        break;
            case 'buyPage':  iconName = focused ? 'cash'           : 'cash-outline';        break;
            case 'sellPage': iconName = focused ? 'storefront'     : 'storefront-outline';  break;
            case 'settings': iconName = focused ? 'settings'       : 'settings-outline';    break;
            case 'messaging': iconName = focused ? 'chatbubble'    : 'chatbubble-outline';  break; // Fixed icon
            default:         iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarLabel:
          route.name === 'buyPage' ? 'Products' :
          route.name === 'sellPage' ? 'Seller' :
          route.name === 'settings' ? 'Settings' :
          route.name === 'index' ? 'Home' : 'Messages',
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="buyPage" options={{
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/cart')}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="cart-outline" size={30} color="#1E4035" marginRight={12} marginBottom={12}  />
          </TouchableOpacity>
        )
      }}
        />
      <Tabs.Screen name="sellPage" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="messaging" />
    </Tabs>
  );
}

const LogoTitle = () =>  (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../../assets/images/logo.png')} 
      style={styles.logo} />
    <Text style={styles.logoText}>crop</Text>
  </View>
)

const styles = StyleSheet.create({
  logo: {
    width: 50,
    height: 50,
  },

  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E4035',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
})



