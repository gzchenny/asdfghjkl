import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { getAuth } from "firebase/auth";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import SellerDashboard from "../components/sellerdash";

export default function SellPage() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [showValidationError, setShowValidationError] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    itemName: "",
    costPerWeight: "",
    quantity: "",
    harvestDate: "",
    imageUrl: "",
  });

  const [open, setOpen] = useState(false);
  const [cropOptions, setCropOptions] = useState([
    { label: "Wheat", value: "Wheat" },
    { label: "Corn", value: "Corn" },
    { label: "Barley", value: "Barley" },
    { label: "Soybeans", value: "Soybeans" },
    { label: "Oats", value: "Oats" },
    { label: "Rice", value: "Rice" },
    { label: "Canola", value: "Canola" },
    { label: "Chickpeas", value: "Chickpeas" },
    { label: "Lentils", value: "Lentils" },
    { label: "Peas", value: "Peas" },
    { label: "Other", value: "Other" },
  ]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchText = (text: string) => {
    const exists = cropOptions.some(
      (item) => item.label.toLowerCase() === text.trim().toLowerCase()
    );
    if (!exists && text.trim()) {
      setCropOptions((prev) => [{ label: text, value: text }, ...prev]);
    }
  };

  const handleSubmit = async () => {
    const { itemName, costPerWeight, quantity, harvestDate } = formData;

    if (!itemName || !costPerWeight || !quantity || !harvestDate) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    try {
      await addDoc(collection(db, "crops"), {
        ...formData,
        costPerWeight: parseFloat(formData.costPerWeight),
        quantity: parseFloat(formData.quantity),
        sellerID: user?.uid || "anonymous",
      });

      Alert.alert("Success", "Crop listed successfully!");

      setFormData({
        itemName: "",
        costPerWeight: "",
        quantity: "",
        harvestDate: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error adding crop:", error);
      Alert.alert("Error", "Failed to list crop.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
      <SellerDashboard />
      <Text style={styles.heading}>List Your Crop</Text>

      {showValidationError && (
        <Text style={styles.requiredNote}>* All fields are required (except image)</Text>
      )}

      <View style={[styles.dropdownWrapper, styles.field]}>
        <DropDownPicker
          open={open}
          setOpen={setOpen}
          value={value}
          setValue={setValue}
          items={cropOptions}
          setItems={setCropOptions}
          onChangeValue={(val) => handleChange("itemName", val ?? "")}
          searchable
          onChangeSearchText={handleSearchText}
          placeholder="Select or type crop name... *"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Cost per Weight ($/kg) *"
          placeholderTextColor="#000000"
          value={formData.costPerWeight}
          onChangeText={(text) => handleChange("costPerWeight", text)}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Quantity (kg) *"
          placeholderTextColor="#000000"
          value={formData.quantity}
          onChangeText={(text) => handleChange("quantity", text)}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Pressable
          onPress={() => {
            setTempSelectedDate(
              formData.harvestDate ? new Date(formData.harvestDate) : new Date()
            );
            setShowDatePicker(true);
          }}
          style={[styles.input, styles.dateField]}
        >
          <Text>{formData.harvestDate || "Select Harvest Date"}</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Image URL (optional)"
          placeholderTextColor="#000000"
          value={formData.imageUrl}
          onChangeText={(text) => handleChange("imageUrl", text)}
          style={styles.input}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Submit Crop" onPress={handleSubmit} color="#ffd33d" />
      </View>

      {showDatePicker && (
        <View style={{ marginTop: 20 }}>
          <DateTimePicker
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            value={tempSelectedDate}
            onChange={(event, selectedDate) => {
              if (event.type === "set" && selectedDate) {
                const formatted = selectedDate.toISOString().split("T")[0];
                handleChange("harvestDate", formatted);
              }
              setShowDatePicker(false);
            }}
          />
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Button
              title="Confirm Date"
              onPress={() => {
                const formatted = tempSelectedDate
                  ? tempSelectedDate.toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0];
                handleChange("harvestDate", formatted);
                setShowDatePicker(false);
              }}
              color="#4CAF50"
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },
  requiredNote: {
    color: "#cc0000",
    marginBottom: 12,
    fontSize: 14,
    fontStyle: "italic",
  },
  dropdownWrapper: {
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
  input: {
    backgroundColor: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  dateField: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  field: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  welcomeContainer: {
    alignSelf: 'stretch',         
    backgroundColor: 'transparent',
    marginBottom: 0, 
    marginLeft: 20,            
  },
  welcomeText: {
    color: '#727272',
    fontSize: 24,
    marginBottom: 0,
  },
  subText: {  
  color: '#1E4035',
  fontSize: 28,
  marginBottom: 20,
  fontWeight: '500',
  },

});