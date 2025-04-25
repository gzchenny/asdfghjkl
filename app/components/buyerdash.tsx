import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function BuyerDashboard() {
    const orders = [
        { id: 1, name: 'Tomatoes', farm: "Uncle Joe's Farm", status: 'Pending' },
        { id: 2, name: 'Corn', farm: "Uncle Joe's Farm", status: 'Shipped' },
        { id: 3, name: 'Apples', farm: "GardenVale Orchard", status: 'Delivered' },
        { id: 4, name: 'Bananas', farm: "Uncle Joe's Farm", status: 'Pending' },
        { id: 4, name: 'Pineapples', farm: "Alexandria Farm", status: 'Shipped' },
        { id: 6, name: 'Celery', farm: "Anna Creek", status: 'Delivered' },
    ];

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView
            style={styles.outerScroll}
            contentContainerStyle={styles.outerContent}
        >
            <View style={styles.section}>
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
        
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Market</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommendations</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        paddingTop: 0,
        paddingHorizontal: 0,
    },

    outerScroll: {
        flex: 1,
        width: '100%',
    },

    outerContent: {
        padding: 16,
        paddingBottom: 40,
    },
    
    section: {
        marginBottom: 24,
        width: '100%',
    },

    pendingWrapper: {
        height: 300,
        width: '100%',
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 24,
        position: 'relative',
        overflow: 'visible',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },

    sectionTitle: {
        fontSize: 30,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1E4035',
    },

    innerScroll: {
        width: '100%',
        maxHeight: 200,
        borderRadius: 6,
        overflow: 'hidden',
    },

    innerContent: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },

    listItem: {
        paddingVertical: 6,
        fontSize: 15,
        color: '#333',
    },

    scrollArrow: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        opacity: 0.5,
        color: '#1E4035',
    },

    orderProduct: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop: 2,
    },
    orderFarm: {
        fontSize: 14,
        color: '#666',
        marginTop: 0,
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E4035',
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 5,
    },

    trendsContainer: {
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        marginVertical: 10,
        marginHorizontal: 20,
    },

    recommendationContainer: {
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        marginBottom: 10,
        marginLeft: 20,
    },

    headerText: {
        color: '#727272',
        fontSize: 22,
        marginBottom: 0,
    },
    subText: {
        color: '#25292e',
        fontSize: 26,
        marginBottom: 5,
    },

    content: {
        alignSelf: 'stretch',
    },
    testingText: {
        fontSize: 48,
        marginTop: 50,
        marginBottom: 50,
        color: '#000',
    },
});
