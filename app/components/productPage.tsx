import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"

const screenHeight = Dimensions.get("window").height;

export default function ProductPage() {
  const { cropId } = useLocalSearchParams();
  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      if (!cropId || typeof cropId !== "string") {
        Alert.alert("Invalid crop ID.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "crops", cropId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCrop(docSnap.data());
        } else {
          Alert.alert("Crop not found.");
        }
      } catch (err) {
        console.error("Error fetching crop:", err);
        Alert.alert("Failed to load product info.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [cropId]);

  const handleBuy = () => {
    Alert.alert("Purchased!", `You bought some ${crop?.itemName}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (!crop) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#fff" }}>Crop not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.container, { minHeight: screenHeight }]}>
        <Image
          source={
            crop.imageURL
              ? { uri: crop.imageURL }
              : require("../../assets/images/react-logo.png")
          }
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>{crop.itemName}</Text>

          <Text style={styles.label}>Harvested</Text>
          <Text style={styles.value}>{crop.harvestDate}</Text>

          <Text style={styles.label}>Price per kg</Text>
          <Text style={styles.value}>${crop.costPerWeight}</Text>

          <Text style={styles.label}>Available</Text>
          <Text style={styles.value}>{crop.quantity} kg</Text>

          <Text style={styles.label}>Seller ID</Text>
          <Text style={styles.value}>{crop.sellerID}</Text>

          <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
            <Text style={styles.buyText}>BUY</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
    justifyContent: "flex-start",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#25292e",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ccc",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: "#ffd33d",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  buyText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
});
