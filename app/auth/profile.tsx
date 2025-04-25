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
  Pressable,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/firebase";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

export default function ProfileSetup() {
  const router = useRouter();
  const auth = getAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("Fetching location...");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("prefer-not-to-say");

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [tempDob, setTempDob] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData) {
              if (userData.firstName && userData.firstName !== "N/A") setFirstName(userData.firstName);
              if (userData.lastName && userData.lastName !== "N/A") setLastName(userData.lastName);
              if (userData.location && userData.location !== "N/A") setLocation(userData.location);
              if (userData.dob && userData.dob !== "N/A") setDob(userData.dob);
              if (userData.phoneNumber && userData.phoneNumber !== "N/A") setPhoneNumber(userData.phoneNumber);
              if (userData.gender) setGender(userData.gender);
            }
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

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const locationData = await Location.getCurrentPositionAsync({});
          const coords = locationData.coords;
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
          if (reverseGeocode.length > 0) {
            const loc = reverseGeocode[0];
            setLocation(`${loc.city || loc.region || "Unknown location"}`);
          }
        } else {
          setLocation("Permission denied");
        }
      } catch (err) {
        console.error("Location error:", err);
        setLocation("Location error");
      }
    })();
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
        });

        Alert.alert("Profile Updated", "Your profile has been set up successfully!", [
          { text: "Continue", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Please provide some additional information to complete your profile</Text>

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

        <Text style={styles.label}>Detected Location</Text>
        <Text style={[styles.input, { color: "#000", paddingTop: 10 }]}>{location}</Text>

        <Text style={styles.label}>Date of Birth</Text>
        <Pressable style={styles.datePressable} onPress={() => setShowDobPicker(true)}>
          <Text style={{ color: dob ? "#000" : "#888" }}>{dob || "Select Date of Birth"}</Text>
        </Pressable>

        {showDobPicker && (
          <>
            <DateTimePicker
              value={tempDob}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={(event, selectedDate) => {
                if (event.type === "set" && selectedDate) {
                  setTempDob(selectedDate);
                } else {
                  setShowDobPicker(false);
                }
              }}
            />
            <View style={{ marginTop: 10 }}>
              <Button
                title="Confirm DOB"
                color="#4CAF50"
                onPress={() => {
                  const formatted = `${tempDob.getMonth() + 1}/${tempDob.getDate()}/${tempDob.getFullYear()}`;
                  setDob(formatted);
                  setShowDobPicker(false);
                }}
              />
            </View>
          </>
        )}

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
          <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker} dropdownIconColor="#fff">
            <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Non-binary" value="non-binary" />
          </Picker>
        </View>

        <Button title="Complete Profile" onPress={handleSubmit} color="#ffd33d" />
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
    height: 42,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 42,
    width: "100%",
    color: "#000",
    paddingHorizontal: 12,
  },
  datePressable: {
    width: "100%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});