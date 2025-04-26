

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface DirectMessagePreviewProps {
  chatId: string;
  otherUserId: string;
  onPress: () => void;
}

export default function DirectMessagePreview({
  chatId,
  otherUserId,
  onPress,
}: DirectMessagePreviewProps) {
  const [userData, setUserData] = useState<any>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setLastMessage({
          id: doc.id,
          ...doc.data(),
        });
      }
    });

    return () => unsubscribe();
  }, [chatId, otherUserId]);

  if (!userData) {
    return null;
  }

  const formattedTime = lastMessage?.timestamp
    ? new Date(lastMessage.timestamp.toDate()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const displayName =
    `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "User";

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.avatar}
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {lastMessage?.timestamp && (
            <Text style={styles.time}>{formattedTime}</Text>
          )}
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {lastMessage ? lastMessage.content : "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  time: {
    color: "#888",
    fontSize: 12,
  },
  message: {
    color: "#666",
    fontSize: 14,
  },
});
