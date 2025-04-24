import { Text, View } from "react-native";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase/firebase";

export default function Index() {
  let firebaseInitialized = false;

  try {
    const app = initializeApp(firebaseConfig);
    firebaseInitialized = !!app;
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>
        {firebaseInitialized
          ? "Firebase is initialized successfully!"
          : "Failed to initialize Firebase."}
      </Text>
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}