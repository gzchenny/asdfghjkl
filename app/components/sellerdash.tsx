import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, } from "react-native";
import ProductsHorizontalScroll from "./addproduct";

export default function SellerDashboard() {
    const products = [
        {
          id: '1',
          name: 'Organic Apples',
          price: '$5.99 per bag',
          image: 'https://via.placeholder.com/150',
          stock: 'In Stock',
          rating: 4.5
        },
        {
          id: '2',
          name: 'Fresh Tomatoes',
          price: '$3.49 per lb',
          image: 'https://via.placeholder.com/150',
          stock: 'In Stock',
          rating: 4.2
        },
        {
          id: '3',
          name: 'Farm Fresh Eggs',
          price: '$5.75 per dozen',
          image: 'https://via.placeholder.com/150',
          stock: 'Low Stock',
          lowStock: true,
          rating: 5.0
        },
        {
          id: '4',
          name: 'Russet Potatoes',
          price: '$4.25 per 2lb bag',
          image: 'https://via.placeholder.com/150',
          stock: 'In Stock',
          rating: 3.5
        },
        {
          id: '5',
          name: 'Organic Spinach',
          price: '$3.99 per bunch',
          image: 'https://via.placeholder.com/150',
          stock: 'In Stock',
          rating: 4.8
        }
      ];

    return (
        <View style={styles.container}>
            <View style={styles.salesContainer}>
                <View style={styles.salesTile}>
                    <Text style={styles.content3}>$66,666</Text>
                    <Text style={styles.content1}>Total Sales</Text>
                </View>
                <View style={styles.salesTile}>
                    <Text style={styles.content3}>2568</Text>
                    <Text style={styles.content1}>Orders</Text>
                </View>
                <View style={styles.salesTile}>
                    <Text style={styles.content3}>$178.50</Text>
                    <Text style={styles.content1}>Average Order</Text>
                </View>
                <View style={styles.salesTile}>
                    <Text style={styles.content3}>4.8</Text>
                    <Text style={styles.content1}>Customer Rating</Text>
                </View>
                <View style={styles.salesGraph}>
       
                </View>

                <View style={styles.productsSection}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.sectionTitle}>Your Products</Text>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>Manage Products</Text>
                        </TouchableOpacity>
                    </View>
                        <ProductsHorizontalScroll />
                    </View>
                        {/* {recommendedProducts.map((product, index) => (
                        <View key={index} style={styles.productsCard}>
                            <Image
                            source={{ uri: product.image }}
                            style={styles.productImage}
                            resizeMode="cover"
                            /> */}
                    </View>
                </View>   
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '# FFFFFF',
        paddingTop: 0,
        paddingHorizontal: 0,
    },
    
    outerScroll: {
        flex: 1,
        width: '100%',
    },
    
    outerContent: {
        padding: 10,
        paddingBottom: 10,
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
    
    section: {
        width: '100%',
    },
    
    pendingWrapper: {
        height: 300,
        width: '100%',
        alignSelf: 'center',
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 60,
        position: 'relative',
        overflow: 'visible',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 3, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    salesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    
    salesTile: {
        width: '48%',             // two tiles per row
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'left',
        shadowColor: '#000000',
        shadowOffset: { width: 3, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    tileValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E4035',
    },
    tileLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    
    salesGraph: {
        width: '100%',
        height: 200,
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
    },

    productsSection: {
        marginTop: 16,
        width: '100%',
    },
    
    productsContainer: {
        paddingHorizontal: 12,
    },
    
    productsCard: {
        width: 150,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        paddingBottom: 8,
    },
    
    productImage: {
        width: '100%',
        height: 100,
    },
    
    productName: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 8,
        marginTop: 6,
        color: '#1E4035',
    },

    content1: {
            fontSize: 14,
            color: '#666',
            marginTop: 0,
            marginLeft: 10,
    },
      
    content2: {
            fontSize: 14,
            fontWeight: '500',
            color: '#1E4035',
            marginLeft: 10,
    },

    content3: {
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
            marginTop: 2,
            marginLeft: 10,
    },

    welcomeContainer: {
            alignSelf: 'stretch',         
            backgroundColor: 'transparent',
            marginBottom: 0, 
            marginLeft: 20,            
    },
    welcomeText: {
        color: '#727272',
        fontSize: 24,
        marginBottom: 0,
    },
    subText: {  
        color: '#1E4035',
        fontSize: 28,
        marginBottom: 20,
        fontWeight: '500',
    },

    sectionTitle: {
        fontSize: 28,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 16,
        color: '#1E4035',
    },

    viewAllText: {
        fontSize: 14,
        color: '#1E4035',
        marginRight: 5,
        textDecorationLine: 'underline',
    },

    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
});