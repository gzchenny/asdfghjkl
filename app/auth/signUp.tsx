import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, Stack } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function SignUp() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      await setDoc(doc(db, "users", userId), {
        firstName: "N/A",
        lastName: "N/A",
        location: "N/A",
        dob: "N/A",
        phoneNumber: "N/A",
        gender: "N/A",
        email: email,
        profileCompleted: false,
        chats: [],
        crops: [],
        orders: [],
        totalSales: 0,
        totalRevenue: 0,
      });

      Alert.alert("Success", "Your account has been created!");
      router.back();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "Email is already in use. Please sign in instead.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "Password is too weak. Please use a stronger password.");
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
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>crop</Text>
      </View>

      <View style={styles.container}>
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
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.signInLink}
        >
          <Text style={styles.signInText}>Already have an account? Sign in!</Text>
        </TouchableOpacity>
      </View>
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

  signInLink: {
    marginTop: 20,
  },

  signInText: {
    color: "#1E4035",
    textDecorationLine: "underline",
    fontSize: 15,
  },

  signUpButton: {
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

  signUpButtonText: {
    color: "#25292e",
    fontSize: 16,
    fontWeight: "600",
  },
});