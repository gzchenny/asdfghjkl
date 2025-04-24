import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

export default function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "You are signed in!");
      onSignIn();
    } catch (error: any) {
      Alert.alert("Error", error.message);
      // Alert.alert("Invalid credentials", "Please check your email and password");
    }
  };

  return (
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
  );
}