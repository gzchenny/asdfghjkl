import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [animations] = useState({
    logoFadeAnim: new Animated.Value(0),
    logoTextFadeAnim: new Animated.Value(0),
    formFadeAnim: new Animated.Value(0)
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(animations.logoFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(animations.logoTextFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animations.formFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

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
        Alert.alert("Error", "User data not found in database");
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        Alert.alert("Error", "User not found. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Invalid email format.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.initialContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.logoContainer, { opacity: animations.logoFadeAnim }]}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
      </Animated.View>
      <Animated.View
        style={[styles.logoContainer, { opacity: animations.logoTextFadeAnim }]}
      >
        <Text style={styles.logoText}>crop</Text>
      </Animated.View>

      <Animated.View style={[styles.container, { opacity: animations.formFadeAnim }]}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/auth/signUp")}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>Don't have an account? Sign up!</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
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
    marginBottom: 20, 
  },

  logo: {
    width: 220,
    height: 220,
    marginBottom: 0,
    paddingBottom: 0,
  },

  logoText: {
    fontSize: 100,
    fontWeight: "700",
    color: "#1E4035",
    marginTop: -20,
    marginBottom: 20,
  },

  container: {
    width: "80%",
    paddingHorizontal: 20,
    alignItems: "center",
    borderColor: "#1E4035",
  },

  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },

  signUpLink: {
    marginTop: 20,
  },

  signUpText: {
    color: "#1E4035",
    textDecorationLine: "underline",
    fontSize: 15,
  },

  signInButton: {
    backgroundColor: "#BFDCCF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  signInButtonText: {
    color: "#25292e",
    fontSize: 16,
    fontWeight: "600",
  },
});