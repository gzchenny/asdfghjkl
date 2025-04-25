import React from "react";
import { Text, View, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/auth/profile");
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
        Settings
      </Text>
      <Button
        title="Edit Profile"
        onPress={handleEditProfile}
        color="#ffd33d"
      />
    </View>
  );
}