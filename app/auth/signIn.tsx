import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Animation values
  const logoFadeAnim = new Animated.Value(0); // For logo and text
  const formFadeAnim = new Animated.Value(0); // For the sign-in form

  useEffect(() => {
    // Fade in the logo and text first
    Animated.timing(logoFadeAnim, {
      toValue: 1, // Final opacity value
      duration: 1500, // Duration in milliseconds
      useNativeDriver: true, // Use native driver for better performance
    }).start(() => {
      // After the logo fades in, fade in the form
      Animated.timing(formFadeAnim, {
        toValue: 1, // Final opacity value
        duration: 1500, // Duration in milliseconds
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.profileCompleted) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth/profile");
        }
      } else {
        Alert.alert("Error", "User data not found in Firestore");
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "User not found. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Incorrect password. Please try again.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.initialContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Logo and text fade-in */}
      <Animated.View style={[styles.logoContainer, { opacity: logoFadeAnim }]}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.logoText}>crop</Text>
      </Animated.View>

      {/* Sign-in form fade-in */}
      <Animated.View style={[styles.container, { opacity: formFadeAnim }]}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => router.push("/auth/signUp")}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>
            Don't have an account? Sign up!
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  initialContainer: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40, // Space between logo and form
  },

  logo: {
    width: 200,
    height: 200,
    marginBottom: 0,
  },

  logoText: {
    fontSize: 100,
    fontWeight: "700",
    color: "#1E4035",
    marginTop: 0,
  },

  container: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  title: {
    color: "#25292e",
    fontSize: 24,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  signUpLink: {
    marginTop: 20,
  },

  signUpText: {
    color: "#1E4035",
    textDecorationLine: "underline",
  },
});
