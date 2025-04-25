import React, { useEffect, useState } from "react";
import { Alert, View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import BuyItem from "../components/BuyItem"; // adjust path if needed

interface Crop {
  id: string;
  sellerID: string;
  itemName: string;
  costPerWeight: number;
  quantity: number;
  harvestDate: string;
  imageURL?: string;
}

export default function BuyPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBuy = (itemName: string, quantity: number, totalCost: number) => {
    Alert.alert("Purchase Successful", `You bought ${quantity} of ${itemName} for $${totalCost.toFixed(2)}`);
  };

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const snapshot = await getDocs(collection(db, "crops"));
        const cropList: Crop[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sellerID: data.sellerID,
            itemName: data.itemName,
            costPerWeight: parseFloat(data.costPerWeight),
            quantity: parseFloat(data.quantity),
            harvestDate: data.harvestDate,
            imageURL: data.imageURL || null,
          };
        });
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
        <Text style={styles.name}>{item.itemName} (Harvested: {item.harvestDate})</Text>
        <Text style={styles.details}>
          {item.costPerWeight !== undefined && item.quantity !== undefined
            ? `$${item.costPerWeight.toFixed(2)} • ${item.quantity}kg`
            : "Incomplete crop data"}
        </Text>
        <Text style={styles.location}>Seller: {item.sellerID}</Text>

        <BuyItem
          itemName={item.itemName}
          itemCost={item.costPerWeight ?? 0}
          onConfirm={handleBuy}
        />
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
    <FlatList
      data={crops}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 12 }}
    />
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
});