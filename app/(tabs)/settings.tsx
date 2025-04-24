import { Text, View } from "react-native";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase/firebase";

export default function Index() {
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>settings.tsx</Text>
    </View>
  );
}