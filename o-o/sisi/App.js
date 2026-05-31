import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import SisiIcon from './components/SisiIcon';

const CHAIRS = [
  {
    id: '1',
    name: 'The Iron Throne',
    type: 'Throne',
    material: '1,000 Swords',
    description: 'Forged by Aegon the Conqueror from the swords of his defeated enemies.',
    image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&auto=format&fit=crop',
    royalty: 'High',
  },
  {
    id: '2',
    name: 'Wingback Royal',
    type: 'Chair',
    material: 'Velvet & Mahogany',
    description: 'A classic high-backed chair designed for comfort and presence.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    royalty: 'Medium',
  },
  {
    id: '3',
    name: 'Imperial Golden Throne',
    type: 'Throne',
    material: 'Solid Gold & Rubies',
    description: 'Used by the emperors of old, shining with divine light.',
    image: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?w=800&auto=format&fit=crop',
    royalty: 'Supreme',
  },
  {
    id: '4',
    name: 'Eames Lounge',
    type: 'Modern Icon',
    material: 'Plywood & Leather',
    description: 'The ultimate symbol of mid-century modern luxury.',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop',
    royalty: 'Low (Modern Elite)',
  },
  {
    id: '5',
    name: 'The Sovereign Bridge',
    type: 'Presidential Throne',
    material: 'Reinforced Concrete & Military Steel',
    description: 'A modern throne built on the foundations of infrastructure and national security. It represents the transition to the New Republic.',
    image: 'https://images.unsplash.com/photo-1589405709100-fd312959885e?w=800&auto=format&fit=crop',
    royalty: 'Supreme (New Era)',
  },
];

export default function App() {
  const [selected, setSelected] = useState(CHAIRS[0]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SisiIcon size={50} />
        <Text style={styles.title}>Sisi</Text>
        <Text style={styles.subtitle}>CHAIRS & THRONES</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.detailContainer}>
          <Image source={{ uri: selected.image }} style={styles.mainImage} />
          <View style={styles.infoBox}>
            <Text style={styles.detailName}>{selected.name}</Text>
            <Text style={styles.detailType}>{selected.type} | {selected.material}</Text>
            <Text style={styles.detailDesc}>{selected.description}</Text>
            <View style={styles.royaltyBadge}>
              <Text style={styles.royaltyText}>ROYALTY: {selected.royalty}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.listTitle}>SELECT YOUR SEAT</Text>
        <FlatList
          data={CHAIRS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, selected.id === item.id && styles.activeCard]} 
              onPress={() => setSelected(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  title: {
    fontSize: 40,
    color: '#d4af37',
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 3,
  },
  main: {
    flex: 1,
    padding: 20,
  },
  detailContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#222',
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  infoBox: {
    padding: 20,
  },
  detailName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  detailType: {
    color: '#d4af37',
    fontSize: 14,
    marginVertical: 5,
  },
  detailDesc: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 22,
  },
  royaltyBadge: {
    marginTop: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#d4af37',
    alignSelf: 'flex-start',
  },
  royaltyText: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listTitle: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
  },
  card: {
    width: 120,
    marginRight: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: '#d4af37',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 5,
  },
  cardText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
