// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
//   TouchableOpacity,
// } from "react-native";
// import {
//   collection,
//   getDocs,
//   doc,
//   getDoc,
//   query,
//   where,
//   setDoc,
//   updateDoc,
//   arrayUnion,
// } from "firebase/firestore";
// import { db } from "../../firebase/firebase";
// import BuyItem from "../components/BuyItem";
// import { useRouter } from "expo-router";
// import { getAuth } from "firebase/auth";
// import { Ionicons } from "@expo/vector-icons";
// import { useCart } from "../components/cartcontext"; // ✅ Import cart context

// interface Crop {
//   id: string;
//   sellerID: string;
//   itemName: string;
//   costPerWeight: number;
//   quantity: number;
//   harvestDate: string;
//   imageURL?: string;
//   sellerFirstName?: string;
//   sellerLastName?: string;
// }

// export default function BuyPage() {
//   const [crops, setCrops] = useState<Crop[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const auth = getAuth();

//   const { cart, addToCart } = useCart(); // ✅ Use cart context

//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce(
//     (sum, item) => sum + item.quantity * item.price,
//     0
//   );

//   const handleMessageSeller = async (sellerId: string) => {
//     const currentUser = auth.currentUser;
//     if (!currentUser) {
//       Alert.alert("Error", "You need to be logged in to message sellers");
//       return;
//     }

//     try {
//       const chatsRef = collection(db, "chats");
//       const q = query(
//         chatsRef,
//         where("userIds", "array-contains", currentUser.uid)
//       );
//       const querySnapshot = await getDocs(q);

//       let existingChatId: string | null = null;
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.userIds && data.userIds.includes(sellerId)) {
//           existingChatId = doc.id;
//         }
//       });

//       let chatId: string;
//       if (existingChatId) {
//         chatId = existingChatId;
//       } else {
//         const newChatRef = doc(collection(db, "chats"));
//         chatId = newChatRef.id;

//         await setDoc(newChatRef, {
//           userIds: [currentUser.uid, sellerId],
//           createdAt: new Date(),
//         });

//         await updateDoc(doc(db, "users", currentUser.uid), {
//           chats: arrayUnion(chatId),
//         });

//         await updateDoc(doc(db, "users", sellerId), {
//           chats: arrayUnion(chatId),
//         });
//       }

//       router.push({
//         pathname: "/(tabs)/messages",
//         params: { chatId, otherUserId: sellerId },
//       });
//     } catch (error) {
//       console.error("Error handling message seller:", error);
//       Alert.alert("Error", "Could not open chat with seller");
//     }
//   };

//   useEffect(() => {
//     const fetchCrops = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "crops"));

//         const cropList: Crop[] = await Promise.all(
//           snapshot.docs.map(async (docSnapshot) => {
//             const data = docSnapshot.data();
//             const cropData: Crop = {
//               id: docSnapshot.id,
//               sellerID: data.sellerID,
//               itemName: data.itemName,
//               costPerWeight: parseFloat(data.costPerWeight),
//               quantity: parseFloat(data.quantity),
//               harvestDate: data.harvestDate,
//               imageURL: data.imageURL || null,
//             };

//             if (data.sellerID) {
//               try {
//                 const userDocRef = doc(db, "users", data.sellerID);
//                 const userDoc = await getDoc(userDocRef);

//                 if (userDoc.exists()) {
//                   const userData = userDoc.data();
//                   cropData.sellerFirstName = userData.firstName || "";
//                   cropData.sellerLastName = userData.lastName || "";
//                 }
//               } catch (error) {
//                 console.error(
//                   `Error fetching user data for seller ${data.sellerID}:`,
//                   error
//                 );
//               }
//             }

//             return cropData;
//           })
//         );

//         setCrops(cropList);
//       } catch (error) {
//         console.error("Error fetching crops:", error);
//         Alert.alert("Error", "Failed to load crop data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCrops();
//   }, []);

//   const renderItem = ({ item }: { item: Crop }) => (
//     <View style={styles.card}>
//       <Image
//         source={
//           item.imageURL
//             ? { uri: item.imageURL }
//             : require("../../assets/images/react-logo.png")
//         }
//         style={styles.image}
//       />
//       <View style={styles.info}>
//         <Text style={styles.name}>
//           {item.itemName} (Harvested: {item.harvestDate})
//         </Text>
//         <Text style={styles.details}>
//           ${item.costPerWeight.toFixed(2)} • {item.quantity}kg
//         </Text>
//         <Text style={styles.location}>
//           Seller: {item.sellerFirstName ?? "?"} {item.sellerLastName ?? "?"}
//         </Text>
//         <Text style={styles.location}>ID: {item.sellerID}</Text>

//         <View style={styles.actionRow}>
//           <BuyItem
//             itemName={item.itemName}
//             itemCost={item.costPerWeight}
//             onConfirm={(itemName, quantity, totalCost) =>
//               addToCart({
//                 id: item.itemName,
//                 itemName,
//                 price: item.costPerWeight,
//                 quantity,
//               })
//             }
//           />

//           <TouchableOpacity
//             style={styles.messageButton}
//             onPress={() => handleMessageSeller(item.sellerID)}
//           >
//             <Ionicons name="chatbubble-outline" size={16} color="white" />
//             <Text style={styles.messageButtonText}>Message Seller</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#00cc99" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <FlatList
//         data={crops}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
//       />

//       {cart.length > 0 && (
//         <View style={styles.cartStrip}>
//           <TouchableOpacity
//             style={styles.cartButton}
//             onPress={() => router.push("/(tabs)/cart")}
//           >
//             <Text style={styles.cartText}>
//               {totalItems} {totalItems === 1 ? "item" : "items"} • $
//               {totalPrice.toFixed(2)}
//             </Text>
//             <Ionicons name="chevron-forward" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   card: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     marginBottom: 15,
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   image: {
//     width: 90,
//     height: 90,
//     backgroundColor: "#eee",
//   },
//   info: {
//     flex: 1,
//     padding: 10,
//     justifyContent: "space-between",
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   details: {
//     fontSize: 14,
//     color: "#444",
//   },
//   location: {
//     fontSize: 12,
//     color: "#888",
//   },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   messageButton: {
//     backgroundColor: "#3498db",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//   },
//   messageButtonText: {
//     color: "white",
//     marginLeft: 5,
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   cartStrip: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#1E4035",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 10,
//     zIndex: 10,
//   },
//   cartButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "100%",
//   },
//   cartText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
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
import DropDownPicker from "react-native-dropdown-picker";
import FilterChipsBar from "../components/filterChipsBar";

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
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const router = useRouter();
  const auth = getAuth();

  const { cart, addToCart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Filter state
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [showFilterSummary, setShowFilterSummary] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(true);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);
  const [dropdownValue, setDropdownValue] = useState<string | null>(null);

  const resetFilters = () => {
    setSelectedCrop(null);
    setSelectedLocation(null);
    setSelectedPrice(null);
  };

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
                console.error(
                  `Error fetching user data for seller ${data.sellerID}:`,
                  error
                );
              }
            }

            return cropData;
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

  const handleFilterPress = (type: string) => {
    setFilterType(type);
    setDropdownValue(null);
    setOpenDropdown(true);
    switch (type) {
      case "crop":
        setDropdownItems([
          { label: "Apple", value: "apple" },
          { label: "Banana", value: "banana" },
          { label: "Barley", value: "barley" },
          { label: "Cabbage", value: "cabbage" },
          { label: "Carrot", value: "carrot" },
          { label: "Corn", value: "corn" },
          { label: "Lettuce", value: "lettuce" },
          { label: "Potato", value: "potato" },
          { label: "Tomato", value: "tomato" },
          { label: "Wheat", value: "wheat" },
        ]);
        break;
      case "location":
        setDropdownItems([
          { label: "ACT", value: "act" },
          { label: "NSW", value: "nsw" },
          { label: "NT", value: "nt" },
          { label: "QLD", value: "qld" },
          { label: "SA", value: "sa" },
          { label: "TAS", value: "tas" },
          { label: "VIC", value: "vic" },
          { label: "WA", value: "wa" },
        ]);
        break;
      case "price":
        setDropdownItems([
          { label: "$0 - $2", value: "0-2" },
          { label: "$2 - $5", value: "2-5" },
          { label: "$5 - $10", value: "5-10" },
          { label: "$10+", value: "10+" },
        ]);
        break;
      default:
        setDropdownItems([]);
    }
  };

  const applyFilter = ({
    crop,
    location,
    price,
  }: {
    crop?: string | null;
    location?: string | null;
    price?: string | null;
  } = {}) => {
    if (crop !== undefined) setSelectedCrop(crop);
    if (location !== undefined) setSelectedLocation(location);
    if (price !== undefined) setSelectedPrice(price);
  };

  const renderItem = ({ item }: { item: Crop }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/productPage",
          params: { cropId: item.id },
        })
      }
    >
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
          <Text style={styles.name}>{item.itemName}</Text>
          <Text style={styles.harvestDate}>Harvested: {item.harvestDate}</Text>
          <Text style={styles.details}>
            ${item.costPerWeight.toFixed(2)} • {item.quantity}kg
          </Text>
          <Text style={styles.seller}>
            Seller: {item.sellerFirstName ?? ""} {item.sellerLastName ?? ""}
            {!item.sellerFirstName && !item.sellerLastName && item.sellerID}
          </Text>

          <View style={styles.actionRow}>
            <BuyItem
              itemName={item.itemName}
              itemCost={item.costPerWeight}
              onConfirm={(itemName, quantity, totalCost) =>
                addToCart({
                  id: item.id,
                  itemName,
                  price: item.costPerWeight,
                  quantity,
                })
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
    </TouchableOpacity>
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
      <FilterChipsBar onFilterPress={handleFilterPress} />

      {activeFiltersCount > 0 && (
        <View style={styles.filterControlsRow}>
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={{ fontWeight: "bold" }}>Reset Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowFilterSummary((prev) => !prev)}
            style={styles.filterSummaryButton}
          >
            <Text style={{ color: "#25292e", fontWeight: "500" }}>
              {activeFiltersCount} Filter{activeFiltersCount > 1 ? "s" : ""}{" "}
              Applied ⌄
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showFilterSummary && (
        <View style={styles.filterSummaryContainer}>
          {selectedCrop && (
            <Text
              style={styles.filterTag}
              onPress={() => setSelectedCrop(null)}
            >
              Crop: {selectedCrop} ✕
            </Text>
          )}
          {selectedLocation && (
            <Text
              style={styles.filterTag}
              onPress={() => setSelectedLocation(null)}
            >
              Location: {selectedLocation} ✕
            </Text>
          )}
          {selectedPrice && (
            <Text
              style={styles.filterTag}
              onPress={() => setSelectedPrice(null)}
            >
              Price: {selectedPrice} ✕
            </Text>
          )}
        </View>
      )}

      {filterType && (
        <View style={styles.filterDropdownContainer}>
          <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
            Filter by {filterType}:
          </Text>
          <DropDownPicker
            open={openDropdown}
            value={dropdownValue}
            items={dropdownItems}
            setOpen={setOpenDropdown}
            setValue={setDropdownValue}
            setItems={setDropdownItems}
            placeholder={`Select ${filterType}`}
            searchable={filterType === "crop"}
            zIndex={9999}
            zIndexInverse={1000}
          />
          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={() => {
              if (filterType === "crop") {
                applyFilter({ crop: dropdownValue });
              } else if (filterType === "location") {
                applyFilter({ location: dropdownValue });
              } else if (filterType === "price") {
                applyFilter({ price: dropdownValue });
              }
              setFilterType(null);
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#000" }}>
              Apply Filter
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={activeFiltersCount > 0 ? filteredCrops : crops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
      />

      {cart.length > 0 && (
        <View style={styles.cartStrip}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Text style={styles.cartText}>
              {totalItems} {totalItems === 1 ? "item" : "items"} • $
              {totalPrice.toFixed(2)}
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  harvestDate: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  details: {
    fontSize: 14,
    color: "#444",
    marginVertical: 4,
  },
  seller: {
    fontSize: 12,
    color: "#999",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
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
  filterControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  resetButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  filterSummaryButton: {
    backgroundColor: "#ffd33d",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterSummaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  filterTag: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterDropdownContainer: {
    padding: 10,
    backgroundColor: "#fffbe6",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    zIndex: 9999,
  },
  applyFilterButton: {
    backgroundColor: "#ffd33d",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
});
