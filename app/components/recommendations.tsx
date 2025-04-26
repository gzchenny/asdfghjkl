import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

export default function RecommendedFarms() {
    const recommendedFarms = [
        {
        id: 1,
        name: "Golden Harvest Farm",
        distance: "1.2 miles away",
        specialty: "Organic Vegetables",
        products: ["Heirloom Tomatoes", "Fresh Kale", "Sweet Corn"],
        },
        {
        id: 2,
        name: "Meadow Valley Farm",
        distance: "2.5 miles away",
        specialty: "Seasonal Fruits",
        products: ["Strawberries", "Blueberries", "Peaches"],
        },
        {
        id: 3,
        name: "Riverbank Gardens",
        distance: "3.8 miles away",
        specialty: "Artisanal Produce",
        products: ["Herbs", "Microgreens", "Edible Flowers"],
        },
        {
        id: 4,
        name: "Mountain Ridge Orchard",
        distance: "5.1 miles away",
        specialty: "Tree Fruits",
        products: ["Apples", "Pears", "Cherries"],
        },
        {
        id: 5,
        name: "Sunny Fields Co-op",
        distance: "4.2 miles away",
        specialty: "Local Dairy & Eggs",
        products: ["Free-range Eggs", "Goat Cheese", "Yogurt"],
        },
    ];

    const renderFarm = ({ item }) => (
        <View style={styles.tile}>
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
            <Text style={styles.farmName}>{item.name}</Text>
            </View>
            <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
            <Text style={styles.specialty}>
            <Text style={styles.bold}>Specialty:</Text> {item.specialty}
            </Text>
            <View style={styles.productsContainer}>
            {item.products.map((product, idx) => (
                <Text key={idx} style={styles.product}>
                {product}
                </Text>
            ))}
            </View>
        </View>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Browse Farm</Text>
        </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Recommended Farms</Text>
        <FlatList
            data={recommendedFarms}
            renderItem={renderFarm}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    list: {
        paddingHorizontal: 8,
    },
    tile: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginRight: 12,
        width: 250,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    farmName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    distanceText: {
        fontSize: 14,
        color: "#666",
    },
    specialty: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    bold: {
        fontWeight: "600",
    },
    productsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    product: {
        backgroundColor: "#f0f0f0",
        color: "#333",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    button: {
        backgroundColor: "#1E4035",
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});