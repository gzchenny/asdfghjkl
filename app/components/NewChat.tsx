import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface NewChatProps {
  visible: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string, otherUserId: string) => void;
}

export default function NewChat({
  visible,
  onClose,
  onChatCreated,
}: NewChatProps) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const handleSubmit = async () => {
    if (!userId.trim()) {
      Alert.alert("Error", "Please enter a user ID");
      return;
    }

    if (userId === currentUser?.uid) {
      Alert.alert("Error", "You cannot start a chat with yourself");
      return;
    }

    setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        Alert.alert("Error", "User not found");
        setLoading(false);
        return;
      }

      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userIds", "array-contains", currentUser?.uid)
      );

      const querySnapshot = await getDocs(q);
      let existingChatId = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userIds.includes(userId)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        onChatCreated(existingChatId, userId);
        onClose();
        return;
      }

      const newChatRef = doc(collection(db, "chats"));
      await setDoc(newChatRef, {
        userIds: [currentUser?.uid, userId],
        createdAt: new Date(),
      });

      await updateDoc(doc(db, "users", currentUser?.uid as string), {
        chats: arrayUnion(newChatRef.id),
      });

      await updateDoc(doc(db, "users", userId), {
        chats: arrayUnion(newChatRef.id),
      });

      onChatCreated(newChatRef.id, userId);
      Alert.alert("Success", "Chat created successfully!");
      setUserId("");
      onClose();
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Chat</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Enter User ID to start a chat</Text>
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />

          <Button
            title={loading ? "Creating..." : "Start Chat"}
            onPress={handleSubmit}
            disabled={loading}
            color="#ffd33d"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});
