// sales summary
// stock review
// pending orders

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WebSellerDashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.sidebar}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>L</Text>
                    <Text style={styles.logoText}>crop</Text>
                </View>

                <View style={styles.navItems}>
                    <TouchableOpacity style={styles.navItem}>
                        <Text style={styles.navText, styles.activeNavItem}>Sales Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Text style={styles.navText}>Stock Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Text style={styles.navText}>Pending Orders</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },

    sidebar: {
        width: 160,
        backgroundColor: '#f2f2f2',
        paddingTop: 16,
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
    },

    welcomeContainer: {
        backgroundColor: '#F5F5F5',
        padding: 20,
        borderTopLeftRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        marginHorizontal: 16,
        marginVertical: 10,
    },

    welcomeText: {
        color: '#7c7c7c',
        fontSize: 20,
    },

    subText: {
        color: '#3D3939',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },

    showPreviousButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },

    logo: {
        width: 24,
        height: 24,
        marginRight: 8,
    },

    logoText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#333',
    },

    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: 'transparent',
    },

    navItems: {
        marginTop: 16,
    },

    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },

    activeNavItem: {
        backgroundColor: '#e6e6e6',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginHorizontal: -10,
    },

    navText: {
        fontSize: 13,
        marginLeft: 10,
        color: '#333',
    },

    inactiveNavText: {
        color: '#666',
    },
});