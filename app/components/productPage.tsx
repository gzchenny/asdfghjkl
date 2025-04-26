import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E4035" />
      </View>
    );
  }

  if (!crop) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Crop not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.outerScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.outerContent}
      >
        <Text style={styles.sectionTitle}>{crop.itemName}</Text>
        
        {/* Main Product Card */}
        <View style={styles.productCard}>
          <Image
            source={
              crop.imageURL
                ? { uri: crop.imageURL }
                : require("../../assets/images/react-logo.png")
            }
            style={styles.image}
            resizeMode="cover"
          />
          
          <View style={styles.productDetails}>
            <View style={styles.farmSection}>
              <Text style={styles.label}>Farm</Text>
              <Text style={styles.farmName}>{crop.sellerID}</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Harvested</Text>
                <Text style={styles.value}>{crop.harvestDate}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.label}>Available</Text>
                <Text style={styles.value}>{crop.quantity} kg</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.label}>Price per kg</Text>
                <Text style={styles.valueBold}>${crop.costPerWeight}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {crop.description || "Fresh produce directly from the farm. Harvested at peak ripeness to ensure the best quality and taste."}
          </Text>
        </View>
        
        {/* Suggested Products */}
        <Text style={styles.sectionSubtitle}>You might also like</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.suggestedContainer}
        >
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.tile}>
              <View>
                <Text style={styles.tileTitle}>Similar Product</Text>
                <Text style={styles.tileSubtitle}>From {crop.sellerID}</Text>
              </View>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
      
      {/* Fixed Buy Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>${(Number(crop.costPerWeight) * 1).toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buyText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  outerScroll: {
    flex: 1,
    width: "100%",
  },
  outerContent: {
    padding: 15,
    paddingBottom: 100, // Space for the fixed bottom bar
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 16,
    color: "#1E4035",
  },
  sectionSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 16,
    color: "#1E4035",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
  },
  productDetails: {
    padding: 16,
  },
  farmSection: {
    marginBottom: 16,
  },
  farmName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  infoItem: {
    width: "50%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#000",
  },
  valueBold: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E4035",
  },
  section: {
    marginTop: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  suggestedContainer: {
    marginBottom: 24,
  },
  tile: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "space-between",
    height: 150,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  tileSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#1E4035",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E4035",
  },
  buyButton: {
    backgroundColor: "#1E4035",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buyText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});