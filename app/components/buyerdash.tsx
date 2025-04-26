import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function BuyerDashboard() {
  const orders = [
    { id: 1, name: "Tomatoes", farm: "Uncle Joe's Farm", status: "Pending" },
    { id: 2, name: "Corn", farm: "Uncle Joe's Farm", status: "Shipped" },
    { id: 3, name: "Apples", farm: "GardenVale Orchard", status: "Delivered" },
    { id: 4, name: "Bananas", farm: "Uncle Joe's Farm", status: "Pending" },
    { id: 5, name: "Pineapples", farm: "Alexandria Farm", status: "Shipped" },
    { id: 6, name: "Celery", farm: "Anna Creek", status: "Delivered" },
  ];

  const orders2: Order[] = [
    {
      id: "1",
      farm: "Sunrise Valley Farm",
      date: "April 19, 2025",
      items: [
        { label: "8 Tomatoes" },
        { label: "2 lb Potatoes" },
        { label: "+2 more" },
      ],
    },
    {
      id: "2",
      farm: "Green Acres Organic",
      date: "April 12, 2025",
      items: [
        { label: "6 Apples" },
        { label: "2 Avocados" },
        { label: "+2 more" },
      ],
    },
    {
      id: "3",
      farm: "Uncle Joe's Farm",
      date: "April 5, 2025",
      items: [
        { label: "5 lb Bananas" },
        { label: "1 dz Eggs" },
        { label: "3 lb Onions" },
      ],
    },
  ];

  const CARD_HEIGHT = 135;
  const WRAPPER_HEIGHT = 450;
  const maxCards = Math.floor(WRAPPER_HEIGHT / CARD_HEIGHT);
  const visibleOrders = orders2.slice(0, maxCards);
  // const displayedItems = item.items.slice(0,2);
  // const remainingCount = item.items.length - displayedItems.length;

  const renderOrder = ({ item, index }: { item: Order; index: number }) => {
    const isFirst = index === 0;
    return (
      <View style={[styles.card, isFirst && styles.cardRecent]}>
        {index === 0 && (
          <View style={styles.badgeRecent}>
            <Ionicons name="time-outline" size={16} color="#1E4035" />
            <Text style={styles.badgeRecentText}>Most Recent Purchase</Text>
          </View>
        )}

        <View style={styles.orderTopRow}>
          <View style={styles.farmDateCol}>
            <Text style={styles.orderProduct}>{item.farm}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <TouchableOpacity style={styles.orderButtonSide}>
            <Text style={styles.orderButtonTextSide}>Order Again</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.itemsContainer,
            isFirst && styles.itemsContainerRecent,
          ]}
        >
          {item.items.map((i, k) => (
            <View
              key={k}
              style={[styles.itemPill, isFirst && styles.itemPillRecent]}
            >
              <Text style={styles.itemPillText}>{i.label}</Text>
            </View>
          ))}
          {/* integration */}
          {/* {displayedItems.map((i, k) => (
                    <View key={k} style={styles.itemPill}>
                        <Text style={styles.itemPillText}>{i.label ?? i}</Text>
                    </View>
                    ))}

                    {remainingCount > 0 && (
                    <View style={styles.itemPill}>
                        <Text style={styles.itemPillText}>+ {remainingCount} more</Text>
                    </View>
                    )} */}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.outerScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.outerContent}
      >
        {/* Pending Orders Section */}
        <View style={styles.pendingWrapper}>
          <Text style={styles.sectionTitle}>Your Orders</Text>
          <ScrollView
            style={styles.innerScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator
            contentContainerStyle={styles.innerContent}
          >
            {orders.map((o, i) => (
              <View key={o.id}>
                <Text style={styles.orderProduct}>{o.name}</Text>
                <View style={styles.orderRow}>
                  <Text style={styles.orderFarm}>{o.farm}</Text>
                  <Text style={styles.orderStatus}>{o.status}</Text>
                </View>
                {i < orders.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </ScrollView>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#888"
            style={styles.scrollArrow}
          />
        </View>

        {/* Order Again Section */}
        <Text style={[styles.sectionTitle, { paddingLeft: 15 }]}>
          Order Again
        </Text>
        <View style={styles.orderAgainWrapper}>
          {visibleOrders.map((item, index) => (
            <View key={item.id}>
              {renderOrder({ item, index })}
              {index < visibleOrders.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.viewMoreSection}>
          <Text style={styles.viewMoreText}>View Order History →</Text>
        </TouchableOpacity>

        {/* Market Trends Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Market</Text>
        </View>

        {/* Recommendations Section */}
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#fff",
    paddingTop: 0,
    paddingHorizontal: 0,
  },

  outerScroll: {
    flex: 1,
    width: "100%",
  },

  outerContent: {
    padding: 10,
    paddingBottom: 10,
  },

  section: {
    width: "100%",
  },

  pendingWrapper: {
    height: 300,
    width: "100%",
    alignSelf: "center",
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 60,
    position: "relative",
    overflow: "visible",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  scrollArrow: {
    alignSelf: "center",
  },

  orderAgainWrapper: {
    height: 390,
    width: "100%",
    alignSelf: "center",
    marginLeft: 15,
    marginRight: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderTopStartRadius: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
  },

  cardRecent: {
    backgroundColor: "#E6F4EA",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
  },

  badgeRecent: {
    flexDirection: "row",
    alignItems: "center",
  },

  badgeRecentText: {
    marginLeft: 4,
    color: "#1E4035",
    fontWeight: "600",
  },

  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  farmDateCol: {
    flex: 1,
    marginRight: 12,
  },

  orderButtonSide: {
    backgroundColor: "#1E4035",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  orderButtonTextSide: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  orderProduct: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 2,
  },

  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },

  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },

  itemPill: {
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },

  itemPillText: {
    fontSize: 12,
    color: "#333",
  },

  itemPillRecent: {
    backgroundColor: "#BFDCCF",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },

  itemPillTextRecent: {
    fontSize: 12,
    color: "#F5F5F5",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 0,
  },

  viewMoreSection: {
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 60,
  },

  viewMoreText: {
    fontSize: 15,
    color: "#6E6E6E",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 16,
    color: "#1E4035",
  },

  innerScroll: {
    width: "100%",
    maxHeight: 200,
    borderRadius: 6,
    overflow: "hidden",
  },

  innerContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  orderFarm: {
    fontSize: 14,
    color: "#666",
    marginTop: 0,
  },

  orderStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E4035",
  },

  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
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
    justifyContent: "space-between", // Ensures the button stays at the bottom
  },
  button: {
    backgroundColor: "#1E4035",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16, // Adds spacing from the content above
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
