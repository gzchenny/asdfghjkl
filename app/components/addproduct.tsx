import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    onAddProductPress: () => void;
}

export default function ProductsHorizontalScroll({ onAddProductPress }: Props) {
    const products = [
        {
            id: '1',
            name: 'Organic Apples',
            image: 'https://via.placeholder.com/150',
            stock: 'In Stock',
        },
        {
            id: '2',
            name: 'Fresh Tomatoes',
            image: 'https://via.placeholder.com/150',
            stock: 'In Stock',
        },
        {
            id: '3',
            name: 'Farm Fresh Eggs',
            image: 'https://via.placeholder.com/150',
            stock: 'Low Stock',
            lowStock: true,
        },
        {
            id: '4',
            name: 'Russet Potatoes',
            image: 'https://via.placeholder.com/150',
            stock: 'In Stock',
        },
        {
            id: '5',
            name: 'Organic Spinach',
            image: 'https://via.placeholder.com/150',
            stock: 'In Stock',
        }
    ];

    return (
        <View style={styles.productsSection}>
            <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
            >
                <TouchableOpacity onPress={onAddProductPress}>
                    <View style={styles.productsContainer}>
                        <View style={styles.addiconContainer}>
                            <Ionicons name="plus" size={24} color="#1E4035" />
                        </View>
                        <Text style={styles.addProductText}>Add Product</Text>
                    </View>
                </TouchableOpacity>

                {products.map(product => (
                <View key={product.id} style={styles.productsCard}>
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: product.image }} 
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="edit-2" size={14} color="#555" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.bottomRow}>
                        <View style={[
                            styles.stockBadge, 
                            product.lowStock ? styles.lowStockBadge : styles.inStockBadge
                        ]}>
                            <Text style={[
                            styles.stockText,
                            product.lowStock ? styles.lowStockText : styles.inStockText
                            ]}>
                            {product.stock}
                            </Text>
                        </View>
                    </View>
                </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    productsSection: {
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 10,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E4035',
    },

    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    viewAllText: {
        fontSize: 14,
        color: '#1E4035',
        marginRight: 5,
    },
    
    productsContainer: {
        paddingHorizontal: 10,
        height: 180,
        alignItems: 'center',
    },

    productsCard: {
        width: 200,
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginRight: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    productImage: {
        width: '100%',
        height: 60,
        borderRadius: 10,
        marginBottom: 10,
    },
});