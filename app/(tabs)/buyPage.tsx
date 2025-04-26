import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
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
import { useCart } from "../components/cartcontext"; // ✅ Import cart context

interface Crop {
  id: string;
  sellerID: string;
  itemName: string;
  costPerWeight: number;
  quantity: number;
  harvestDate: string;
  imageURL?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
}

export default function BuyPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  const { cart, addToCart } = useCart(); // ✅ Use cart context

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleMessageSeller = async (sellerId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You need to be logged in to message sellers");
      return;
    }

    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("userIds", "array-contains", currentUser.uid));
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

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const snapshot = await getDocs(collection(db, "crops"));

        const cropList: Crop[] = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const cropData: Crop = {
              id: docSnapshot.id,
              sellerID: data.sellerID,
              itemName: data.itemName,
              costPerWeight: parseFloat(data.costPerWeight),
              quantity: parseFloat(data.quantity),
              harvestDate: data.harvestDate,
              imageURL: data.imageURL || null,
            };

            if (data.sellerID) {
              try {
                const userDocRef = doc(db, "users", data.sellerID);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  cropData.sellerFirstName = userData.firstName || "";
                  cropData.sellerLastName = userData.lastName || "";
                }
              } catch (error) {
                console.error(`Error fetching user data for seller ${data.sellerID}:`, error);
              }
            }

            return cropData;
          })
        );

        setCrops(cropList);
      } catch (error) {
        console.error("Error fetching crops:", error);
        Alert.alert("Error", "Failed to load crop data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const renderItem = ({ item }: { item: Crop }) => (
    <View style={styles.card}>
      <Image
        source={item.imageURL ? { uri: item.imageURL } : require("../../assets/images/react-logo.png")}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.itemName} (Harvested: {item.harvestDate})
        </Text>
        <Text style={styles.details}>
          ${item.costPerWeight.toFixed(2)} • {item.quantity}kg
        </Text>
        <Text style={styles.location}>
          Seller: {item.sellerFirstName ?? "?"} {item.sellerLastName ?? "?"}
        </Text>
        <Text style={styles.location}>ID: {item.sellerID}</Text>

        <View style={styles.actionRow}>
          <BuyItem
            itemName={item.itemName}
            itemCost={item.costPerWeight}
            onConfirm={(itemName, quantity, totalCost) =>
              addToCart({ id: item.itemName, itemName, price: item.costPerWeight, quantity })
            }
          />

          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessageSeller(item.sellerID)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="white" />
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00cc99" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={crops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
      />

      {cart.length > 0 && (
        <View style={styles.cartStrip}>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/(tabs)/cart")}>
            <Text style={styles.cartText}>
              {totalItems} {totalItems === 1 ? "item" : "items"} • ${totalPrice.toFixed(2)}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#444",
  },
  location: {
    fontSize: 12,
    color: "#888",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  messageButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    zIndex: 10,
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
    fontWeight: "bold",
  },
});
