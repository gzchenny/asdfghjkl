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

  const handleSignUp = async () => {
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
      Alert.alert("Error", error.message);
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
          backgroundColor: "#FFFFFF",
          padding: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24, marginBottom: 20 }}>
          Sign Up
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
        <Button title="Sign Up" onPress={handleSignUp} color="#ffd33d" />
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#ffd33d", textDecorationLine: "underline" }}>
            Already have an account? Sign in!
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
