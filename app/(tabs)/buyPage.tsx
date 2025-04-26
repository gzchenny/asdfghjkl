<<<<<<< Updated upstream
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
      <Text>buyPage.tsx</Text>
    </View>
  );
}
=======
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
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import BuyItem from "../components/BuyItem";
import DropDownPicker from "react-native-dropdown-picker";
import FilterChipsBar from "../components/filterChipsBar";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";


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
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);

  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [showFilterSummary, setShowFilterSummary] = useState(false);

  const router = useRouter();

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

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const snapshot = await getDocs(collection(db, "crops"));
        const cropList: Crop[] = snapshot.docs.map((doc) => {
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
      result = result.filter(c => c.itemName.toLowerCase() === selectedCrop.toLowerCase());
    }
    if (selectedLocation) {
      result = result.filter(c => c.sellerID.toLowerCase().includes(selectedLocation.toLowerCase()));
    }
    if (selectedPrice) {
      result = result.filter(c => {
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

  const handleBuy = (itemName: string, quantity: number, totalCost: number) => {
    Alert.alert("Purchase Successful", `You bought ${quantity} of ${itemName} for $${totalCost.toFixed(2)}`);
  };

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

  const applyFilter = ({ crop, location, price }: { crop?: string | null; location?: string | null; price?: string | null } = {}) => {
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
          source={item.imageURL ? { uri: item.imageURL } : require("../../assets/images/react-logo.png")}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.itemName}</Text>
          <Text style={styles.harvestDate}>Harvested: {item.harvestDate}</Text>
          <Text style={styles.details}>${item.costPerWeight.toFixed(2)} • {item.quantity}kg</Text>
          <Text style={styles.seller}>Seller: {item.sellerID}</Text>
          <View style={styles.buySection}>
            <BuyItem
              itemName={item.itemName}
              itemCost={item.costPerWeight ?? 0}
              onConfirm={handleBuy}
            />
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <FilterChipsBar onFilterPress={handleFilterPress} />
      {activeFiltersCount > 0 && (
        <TouchableOpacity
          onPress={resetFilters}
          style={{
            backgroundColor: '#e0e0e0',
            padding: 10,
            borderRadius: 6,
            marginHorizontal: 10,
            marginTop: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Reset Filters</Text>
        </TouchableOpacity>
      )}
      

      {activeFiltersCount > 0 && (
        <TouchableOpacity
          onPress={() => setShowFilterSummary(prev => !prev)}
          style={{
            backgroundColor: '#ffd33d',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 6,
            alignSelf: 'flex-start',
            marginLeft: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ color: '#25292e', fontWeight: '500' }}>
            {activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Applied ⌄
          </Text>
        </TouchableOpacity>
      )}

      {showFilterSummary && (
        <View style={{ marginLeft: 10, marginBottom: 10 }}>
          {selectedCrop && (
            <Text style={{ backgroundColor: '#fff', padding: 6, borderRadius: 8, marginVertical: 2 }} onPress={() => setSelectedCrop(null)}>
              Crop: {selectedCrop}
            </Text>
          )}
          {selectedLocation && (
            <Text style={{ backgroundColor: '#fff', padding: 6, borderRadius: 8, marginVertical: 2 }} onPress={() => setSelectedLocation(null)}>
              Location: {selectedLocation}
            </Text>
          )}
          {selectedPrice && (
            <Text style={{ backgroundColor: '#fff', padding: 6, borderRadius: 8, marginVertical: 2 }} onPress={() => setSelectedPrice(null)}>
              Price: {selectedPrice}
            </Text>
          )}
        </View>
      )}

      {filterType && (
        <View style={{ padding: 10, backgroundColor: '#fffbe6', borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10, zIndex: 9999 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Filter by {filterType}:</Text>
          <DropDownPicker
            open={openDropdown}
            value={dropdownValue}
            items={dropdownItems}
            setOpen={setOpenDropdown}
            setValue={setDropdownValue}
            setItems={setDropdownItems}
            placeholder={`Select ${filterType}`}
            searchable={filterType === 'crop'}
            zIndex={9999}
            zIndexInverse={1000}
          />
          <TouchableOpacity
            style={{ backgroundColor: '#ffd33d', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 10 }}
            onPress={() => {
              if (filterType === 'crop') {
                applyFilter({ crop: dropdownValue });
              } else if (filterType === 'location') {
                applyFilter({ location: dropdownValue });
              } else if (filterType === 'price') {
                applyFilter({ price: dropdownValue });
              }
              setFilterType(null);
            }}
          >
            <Text style={{ fontWeight: 'bold', color: '#000' }}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {(activeFiltersCount > 0 ? filteredCrops : crops).map((item) => (
        <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
      ))}
    </ScrollView>
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
  buySection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
});
>>>>>>> Stashed changes
