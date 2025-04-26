import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import BuyItem from "../components/BuyItem";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../components/cartcontext";
import FilterChipsBar from "../components/filterChipsBar";

interface Crop {
  id: string;
  sellerID: string;
  itemName: string;
  costPerWeight: number; // This will be the predicted price when available
  quantity: number;
  harvestDate: string;
  imageURL?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
}

export default function BuyPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const router = useRouter();
  const auth = getAuth();
  const { cart, addToCart } = useCart();

  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const activeFiltersCount =
    (selectedCrop ? 1 : 0) +
    (selectedLocation ? 1 : 0) +
    (selectedPrice ? 1 : 0);

  const handleMessageSeller = async (sellerId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You need to be logged in to message sellers");
      return;
    }

    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userIds", "array-contains", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      let existingChatId: string | null = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userIds && data.userIds.includes(sellerId)) {
          existingChatId = doc.id;
        }
      });

      let chatId: string;
      if (existingChatId) {
        chatId = existingChatId;
      } else {
        const newChatRef = doc(collection(db, "chats"));
        chatId = newChatRef.id;

        await setDoc(newChatRef, {
          userIds: [currentUser.uid, sellerId],
          createdAt: new Date(),
        });

        await updateDoc(doc(db, "users", currentUser.uid), {
          chats: arrayUnion(chatId),
        });

        await updateDoc(doc(db, "users", sellerId), {
          chats: arrayUnion(chatId),
        });
      }

      router.push({
        pathname: "/(tabs)/messages",
        params: { chatId, otherUserId: sellerId },
      });
    } catch (error) {
      console.error("Error handling message seller:", error);
      Alert.alert("Error", "Could not open chat with seller");
    }
  };

  const fetchPredictedPrice = async (productName: string): Promise<number> => {
    const API_BASE_URL = "10.12.241.155:5000"; // Replace with your actual IP address
    try {
      const response = await fetch(`http://${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: productName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch predicted price");
      }

      const data = await response.json();
      return data.prediction;
    } catch (error) {
      console.error("Error fetching predicted price:", error);
      return -1; // Return -1 to indicate error
    }
  };

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const snapshot = await getDocs(collection(db, "crops"));

        const cropsWithoutPredictions = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            sellerID: data.sellerID,
            itemName: data.itemName,
            costPerWeight: parseFloat(data.costPerWeight), // Will be replaced with prediction if available
            quantity: parseFloat(data.quantity),
            harvestDate: data.harvestDate,
            imageURL: data.imageURL || null,
            sellerFirstName: "",
            sellerLastName: "",
          };
        });

        const cropList: Crop[] = await Promise.all(
          cropsWithoutPredictions.map(async (crop) => {
            if (crop.sellerID) {
              try {
                const userDocRef = doc(db, "users", crop.sellerID);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  crop.sellerFirstName = userData.firstName || "";
                  crop.sellerLastName = userData.lastName || "";
                }
              } catch (error) {
                console.error(
                  `Error fetching user data for seller ${crop.sellerID}:`,
                  error
                );
              }
            }

            try {
              const predictedPrice = await fetchPredictedPrice(crop.itemName);
              if (predictedPrice > 0) {
                crop.costPerWeight = predictedPrice; // Replace with predicted price
              }
            } catch (error) {
              console.error(
                `Error getting predicted price for ${crop.itemName}:`,
                error
              );
            }

            return crop;
          })
        );

        setCrops(cropList);
        setFilteredCrops(cropList);
      } catch (error) {
        console.error("Error fetching crops:", error);
        Alert.alert("Error", "Failed to load crop data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  useEffect(() => {
    let result = [...crops];
    if (selectedCrop) {
      result = result.filter(
        (c) => c.itemName.toLowerCase() === selectedCrop.toLowerCase()
      );
    }
    if (selectedLocation) {
      result = result.filter((c) =>
        c.sellerID.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    if (selectedPrice) {
      result = result.filter((c) => {
        const price = c.costPerWeight;
        if (selectedPrice === "0-2") return price <= 2;
        if (selectedPrice === "2-5") return price > 2 && price <= 5;
        if (selectedPrice === "5-10") return price > 5 && price <= 10;
        if (selectedPrice === "10+") return price > 10;
        return true;
      });
    }
    setFilteredCrops(result);
  }, [selectedCrop, selectedLocation, selectedPrice, crops]);

  const renderItem = ({ item }: { item: Crop }) => (
    <View style={styles.card}>
      <Image
        source={
          item.imageURL
            ? { uri: item.imageURL }
            : require("../../assets/images/react-logo.png")
        }
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.itemName}</Text>
          <Text style={styles.price}>${item.costPerWeight.toFixed(2)}/kg</Text>
        </View>
        <Text style={styles.harvestDate}>Harvested: {item.harvestDate}</Text>
        <Text style={styles.quantityText}>Available: {item.quantity}kg</Text>

        <View style={styles.sellerRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.seller}>
            {item.sellerFirstName ?? ""} {item.sellerLastName ?? ""}
            {!item.sellerFirstName && !item.sellerLastName && item.sellerID}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <BuyItem
            productName={item.itemName}
            farmName={item.sellerFirstName ?? ""}
            initialQuantity={1}
            pricePerItem={item.costPerWeight}
            onConfirm={(itemName, quantity, totalCost) => {
              addToCart({
                id: item.id,
                itemName,
                price: item.costPerWeight,
                quantity,
              });
              console.log(
                `Added ${quantity} x ${itemName} = $${totalCost.toFixed(2)}`
              );
              Alert.alert(
                "Added to Cart",
                `Added ${quantity} × ${itemName} to your cart for $${totalCost.toFixed(
                  2
                )}`
              );
            }}
          />

          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessageSeller(item.sellerID)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E4035" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Market Products</Text>
      <FilterChipsBar
        onFilterPress={(type) => console.log(`Filter pressed: ${type}`)}
      />
      <FlatList
        data={filteredCrops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.productsWrapper}
      />

      {/* Add Cart Strip */}
      {cart.length > 0 && (
        <View style={styles.cartStrip}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <Text style={styles.cartText}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items | $
              {cart
                .reduce((sum, item) => sum + item.quantity * item.price, 0)
                .toFixed(2)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.cartText}>View Cart</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="white"
                style={{ marginLeft: 5 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  outerScroll: {
    flex: 1,
    width: "100%",
  },
  outerContent: {
    padding: 15,
    paddingBottom: 100, // Extra padding for cart strip
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 10,
    marginLeft: 25,
    marginBottom: 16,
    color: "#1E4035",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  productsWrapper: {
    marginTop: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    width: "95%",
    marginHorizontal: "auto",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: "#F0F0F0",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E4035",
  },
  harvestDate: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
  },
  quantityText: {
    fontSize: 14,
    color: "#444444",
    marginVertical: 4,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  seller: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF",
    paddingTop: 10,
  },
  messageButton: {
    backgroundColor: "#3498DB",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  messageButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "500",
  },
  cartStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E4035",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 6,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filterControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: "#E6F4EA",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  resetButtonText: {
    fontWeight: "600",
    color: "#1E4035",
  },
  filterSummaryButton: {
    backgroundColor: "#BFDCCF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterSummaryText: {
    color: "#1E4035",
    fontWeight: "600",
  },
  filterSummaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 10,
  },
  filterTag: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 13,
  },
  filterDropdownContainer: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 9999,
  },
  filterDropdownTitle: {
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 16,
    color: "#1E4035",
  },
  dropdown: {
    borderColor: "#E0E0E0",
    borderRadius: 6,
  },
  dropdownContainer: {
    borderColor: "#E0E0E0",
  },
  dropdownPlaceholder: {
    color: "#666666",
  },
  applyFilterButton: {
    backgroundColor: "#1E4035",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 15,
  },
  applyFilterText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  predictedPriceLabel: {
    fontSize: 12,
    color: "#555555",
    marginRight: 4,
  },
  predictedPriceValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginRight: 6,
  },
  priceDiffTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priceDiffGood: {
    backgroundColor: "#E6F4EA",
  },
  priceDiffBad: {
    backgroundColor: "#FEEAE6",
  },
  priceDiffText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
