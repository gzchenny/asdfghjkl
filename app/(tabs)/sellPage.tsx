import React, { useState, useEffect } from "react";
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
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { getAuth } from "firebase/auth";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function SellPage() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userCrops, setUserCrops] = useState<any[]>([]);

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
    { label: "Apples", value: "Apples" },
    { label: "Bananas", value: "Bananas" },
    { label: "Potatoes", value: "Potatoes" },
    { label: "Tomatoes", value: "Tomatoes" },
    { label: "Carrots", value: "Carrots" },
    { label: "Tomatoes", value: "Tomatoes" },
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const cropsQuery = query(
          collection(db, "crops"),
          where("sellerID", "==", user.uid)
        );
        const cropsSnapshot = await getDocs(cropsQuery);
        const cropsData = cropsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserCrops(cropsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load your seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleOpenAddCrop = () => {
    setShowAddCropModal(true);
  };

  const handleCloseAddCrop = () => {
    setShowAddCropModal(false);
    setFormData({
      itemName: "",
      costPerWeight: "",
      quantity: "",
      harvestDate: "",
      imageUrl: "",
    });
    setValue(null);
    setShowValidationError(false);
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchText = (text: string) => {
    const exists = cropOptions.some(
      (item) => item.label.toLowerCase() === text.toLowerCase()
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
      // Generate a unique ID for the crop
      const cropId = `crop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Add the crop to the crops collection
      await addDoc(collection(db, "crops"), {
        ...formData,
        cropId: cropId,
        costPerWeight: parseFloat(formData.costPerWeight),
        quantity: parseFloat(formData.quantity),
        sellerID: user?.uid || "anonymous",
        sales: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
      });

      // Update the user document
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Get current crops and orders arrays (initializing if they don't exist)
          const currentCrops = userData.crops || [];
          const currentOrders = userData.orders || [];

          // Create a new crop entry for the user's crops array
          const cropEntry = {
            id: cropId,
            name: itemName,
            dateAdded: new Date().toISOString(),
            quantity: parseFloat(quantity),
            price: parseFloat(costPerWeight),
            sales: 0,
            active: true,
          };

          // Update the user document with the new crop and maintain stats
          await updateDoc(userRef, {
            crops: [...currentCrops, cropEntry],
            orders: currentOrders,
            totalListings: (userData.totalListings || 0) + 1,
          });
        }
      }

      Alert.alert("Success", "Crop listed successfully!");
      handleCloseAddCrop();

      // Refresh data
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const cropsQuery = query(
          collection(db, "crops"),
          where("sellerID", "==", user.uid)
        );
        const cropsSnapshot = await getDocs(cropsQuery);
        const cropsData = cropsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserCrops(cropsData);
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      Alert.alert("Error", "Failed to list crop.");
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#1E4035" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.dashboardContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.dashboardTitle}>Seller Dashboard</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenAddCrop}
          >
            <Ionicons name="add-circle" size={24} color="#1E4035" />
            <Text style={styles.addButtonText}>Add New Crop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Listings</Text>
          {userCrops.length > 0 ? (
            userCrops.map((crop) => (
              <View key={crop.id} style={styles.cropCard}>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{crop.itemName}</Text>
                  <Text style={styles.cropDetails}>
                    {crop.quantity}kg • ${crop.costPerWeight}/kg
                  </Text>
                </View>
                <View style={styles.cropStats}>
                  <Text style={styles.salesText}>{crop.sales || 0} sales</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>
              No crops listed yet. Add your first crop!
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Overview</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData?.totalSales || 0}</Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statValue}>
                ${userData?.totalRevenue || 0}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userCrops.length}</Text>
              <Text style={styles.statLabel}>Active Crops</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {userData?.orders && userData.orders.length > 0 ? (
            userData.orders.slice(0, 2).map((order: any, index: number) => (
              <View key={index} style={styles.orderCard}>
                <Text style={styles.orderTitle}>
                  Order #{order.id || index + 1000}
                </Text>
                <Text style={styles.orderDetails}>
                  {order.item} - {order.quantity}kg
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>
                    {order.date || "Recent order"}
                  </Text>
                  <Text style={styles.orderStatus}>
                    {order.status || "Processing"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>
              No orders yet. Your orders will appear here.
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddCropModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseAddCrop}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseAddCrop}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Crop</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {showValidationError && (
              <Text style={styles.requiredNote}>
                * All fields are required (except image)
              </Text>
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
                    formData.harvestDate
                      ? new Date(formData.harvestDate)
                      : new Date()
                  );
                  setShowDatePicker(true);
                }}
                style={[styles.input, styles.dateField]}
              >
                <Text>{formData.harvestDate || "Select Harvest Date *"}</Text>
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

            <View style={styles.submitButtonContainer}>
              <Button
                title="List Crop"
                onPress={handleSubmit}
                color="#1E4035"
              />
            </View>
          </ScrollView>

          {showDatePicker && (
            <>
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                value={tempSelectedDate}
                textColor="#000"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    setTempSelectedDate(selectedDate);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
              />

              <View style={styles.datePickerButtonContainer}>
                <Button
                  title="Confirm Date"
                  onPress={() => {
                    const formatted = tempSelectedDate
                      .toISOString()
                      .split("T")[0];
                    handleChange("harvestDate", formatted);
                    setShowDatePicker(false);
                  }}
                  color="#4CAF50"
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  dashboardContainer: {
    flex: 1,
    height: "50%",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E4035",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    marginLeft: 4,
    color: "#1E4035",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1E4035",
  },
  cropCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: "600",
  },
  cropDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cropStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  salesText: {
    fontSize: 14,
    color: "#4CAF50",
    marginRight: 12,
  },
  editButton: {
    padding: 4,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e0e0e0",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E4035",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  orderCard: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  orderDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  orderDate: {
    fontSize: 12,
    color: "#888",
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#f4f4f4",
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
  submitButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  datePickerButtonContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  emptyStateText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    padding: 16,
  },
});
