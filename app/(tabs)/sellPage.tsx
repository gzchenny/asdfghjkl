import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function SellPage() {
  const [formData, setFormData] = useState({
    sellerID: "",
    itemName: "",
    costPerWeight: "",
    quantity: "",
    harvestDate: "",
    imageURL: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const { sellerID, itemName, costPerWeight, quantity, harvestDate } = formData;

    if (!sellerID || !itemName || !costPerWeight || !quantity || !harvestDate) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "crops"), {
        sellerID,
        itemName,
        costPerWeight: parseFloat(costPerWeight),
        quantity: parseFloat(quantity),
        harvestDate,
        imageURL: formData.imageURL || "",
      });
      Alert.alert("Success", "Crop listed successfully!");
      setFormData({
        sellerID: "",
        itemName: "",
        costPerWeight: "",
        quantity: "",
        harvestDate: "",
        imageURL: "",
      });
    } catch (error) {
      console.error("Error adding crop:", error);
      Alert.alert("Error", "Failed to list crop.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>List Your Crop</Text>

      <TextInput
        placeholder="Seller ID"
        value={formData.sellerID}
        onChangeText={(text) => handleChange("sellerID", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Crop Name"
        value={formData.itemName}
        onChangeText={(text) => handleChange("itemName", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Price per kg ($)"
        value={formData.costPerWeight}
        onChangeText={(text) => handleChange("costPerWeight", text)}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Quantity (kg)"
        value={formData.quantity}
        onChangeText={(text) => handleChange("quantity", text)}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Harvest Date (YYYY-MM-DD)"
        value={formData.harvestDate}
        onChangeText={(text) => handleChange("harvestDate", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Image URL (optional)"
        value={formData.imageURL}
        onChangeText={(text) => handleChange("imageURL", text)}
        style={styles.input}
      />

      <Button title="Submit Crop" onPress={handleSubmit} color="#ffd33d" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});
