import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAuth } from "firebase/auth";

interface ChatBubbleProps {
  message: {
    senderId: string;
    content: string;
    timestamp: any;
  };
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const isCurrentUser = currentUser?.uid === message.senderId;

  const formattedTime = message.timestamp
    ? new Date(message.timestamp.toDate()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUser : styles.otherUser,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
      <Text style={styles.timestamp}>{formattedTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  currentUser: {
    alignSelf: "flex-end",
  },
  otherUser: {
    alignSelf: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: "#ffd33d",
  },
  otherUserBubble: {
    backgroundColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
    alignSelf: "flex-end",
  },
});
