import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/firebase";
import { Picker } from "@react-native-picker/picker";

export default function ProfileSetup() {
  const router = useRouter();
  const auth = getAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("A");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("prefer-not-to-say");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData) {
              if (userData.firstName && userData.firstName !== "N/A")
                setFirstName(userData.firstName);
              if (userData.lastName && userData.lastName !== "N/A")
                setLastName(userData.lastName);
            }
            if (userData.location && userData.location !== "N/A")
              setLocation(userData.location);
            if (userData.dob && userData.dob !== "N/A") setDob(userData.dob);
            if (userData.phoneNumber && userData.phoneNumber !== "N/A")
              setPhoneNumber(userData.phoneNumber);
            if (userData.gender) setGender(userData.gender);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        router.replace("/auth/signIn");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    try {
      if (userId) {
        await updateDoc(doc(db, "users", userId), {
          firstName,
          lastName,
          location,
          dob,
          phoneNumber,
          gender,
          profileCompleted: true,
          chats: [],
        });

        Alert.alert(
          "Profile Updated",
          "Your profile has been set up successfully!",
          [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
        );
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Please provide some additional information to complete your profile
        </Text>

        <TextInput
          placeholder="First Name"
          placeholderTextColor="#aaa"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />

        <TextInput
          placeholder="Last Name"
          placeholderTextColor="#aaa"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />

        <Text style={styles.label}>Location</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => setLocation(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Location A" value="A" />
            <Picker.Item label="Location B" value="B" />
            <Picker.Item label="Location C" value="C" />
          </Picker>
        </View>

        <TextInput
          placeholder="Date of Birth (MM/DD/YYYY)"
          placeholderTextColor="#aaa"
          value={dob}
          onChangeText={setDob}
          style={styles.input}
        />

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#aaa"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Non-binary" value="non-binary" />
          </Picker>
        </View>

        <Button
          title="Complete Profile"
          onPress={handleSubmit}
          color="#ffd33d"
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#ddd",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#444",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: "#fff",
  },
});
