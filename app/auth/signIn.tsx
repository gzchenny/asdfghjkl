import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

export default function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          onSignIn();
        } else {
          router.replace("/auth/profile");
        }
      } else {
        Alert.alert("Error", "User data not found in Firestore"); // Should not happen.
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#25292e",
          padding: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24, marginBottom: 20 }}>
          Sign In
        </Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          style={{
            width: "100%",
            height: 40,
            backgroundColor: "#fff",
            borderRadius: 5,
            marginBottom: 10,
            paddingHorizontal: 10,
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          style={{
            width: "100%",
            height: 40,
            backgroundColor: "#fff",
            borderRadius: 5,
            marginBottom: 20,
            paddingHorizontal: 10,
          }}
          secureTextEntry
        />
        <Button title="Sign In" onPress={handleSignIn} color="#ffd33d" />
        <TouchableOpacity
          onPress={() => router.push("/auth/signUp")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#ffd33d", textDecorationLine: "underline" }}>
            Don't have an account? Sign up!
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
