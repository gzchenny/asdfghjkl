import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import DirectMessagePreview from "../components/DirectMessagePreview";
import DirectMessage from "../components/DirectMessage";
import NewChat from "../components/NewChat";

export default function ChatScreen() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    otherUserId: string;
  } | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const openNewChat = () => {
    setShowNewChat(true);
  };

  const closeNewChat = () => {
    setShowNewChat(false);
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const chatsRef = collection(db, "chats");
        const q = query(
          chatsRef,
          where("userIds", "array-contains", currentUser.uid)
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const chatData: any[] = [];

            querySnapshot.docs.forEach((doc) => {
              const chatId = doc.id;
              const data = doc.data();

              const otherUserId = data.userIds.find(
                (id: string) => id !== currentUser.uid
              );

              chatData.push({
                id: chatId,
                otherUserId,
                ...data,
              });
            });

            setChats(chatData);
            setLoading(false);
          },
          (error) => {
            console.error("Error in chat snapshot:", error);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up chat listener:", error);
        setLoading(false);
        return () => {};
      }
    };

    fetchChats();
  }, [currentUser]);

  const handleChatPress = (chatId: string, otherUserId: string) => {
    setSelectedChat({ id: chatId, otherUserId });
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleNewChatCreated = (chatId: string, otherUserId: string) => {
    setSelectedChat({ id: chatId, otherUserId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (selectedChat) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
            title: "Chat",
          }}
        />
        <DirectMessage
          chatId={selectedChat.id}
          otherUserId={selectedChat.otherUserId}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Messages",
        }}
      />

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={openNewChat}
          >
            <Text style={styles.startChatText}>Start a new chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chatListContainer}>
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DirectMessagePreview
                chatId={item.id}
                otherUserId={item.otherUserId}
                onPress={() => handleChatPress(item.id, item.otherUserId)}
              />
            )}
          />
          <TouchableOpacity
            style={styles.floatingNewChatButton}
            onPress={openNewChat}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <NewChat
        visible={showNewChat}
        onClose={closeNewChat}
        onChatCreated={handleNewChatCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 20,
  },
  startChatButton: {
    backgroundColor: "#ffd33d",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startChatText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    paddingLeft: 10,
  },
  newChatButton: {
    paddingRight: 10,
  },
  chatListContainer: {
    flex: 1,
    position: "relative",
  },
  floatingNewChatButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#ffd33d",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
