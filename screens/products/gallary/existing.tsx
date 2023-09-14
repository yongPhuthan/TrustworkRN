import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {CompanyUser, Service} from '../../../types/docType';
import {ParamListBase, ProductItem} from '../../../types/navigationType';

type Props = {
  navigation: StackNavigationProp<ParamListBase, 'ExistingCategories'>;
  route: RouteProp<ParamListBase, 'ExistingCategories'>;
  // onGoBack: (data: string) => void;
};

const mockGalleryCategories = [
    {
      id: "cat1",
      name: "หมวดหมู่ 1",
      serviceGalleries: ["sg1", "sg2","sg3", "sg4"],
      companyUser: null,
      companyUserId: null,
    },
    {
      id: "cat2",
      name: "หมวดหมู่ 2",
      serviceGalleries: ["sg2"],
      companyUser: null,
      companyUserId: null,
    },
    {
        id: "cat3",
        name: "หมวดหมู่ 3",
        serviceGalleries: ["sg1", "sg2"],
        companyUser: null,
        companyUserId: null,
      },
      
  ];
  
  const mockServiceGalleries = [
    {
      id: "sg1",
      imgSrc: ["https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png","https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png","https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png","https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png"],
      categories: ["cat1"],
      services: [],
      companyUser: null,
      companyUserId: null,
    },
    {
        id: "sg3",
        imgSrc: ["https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png"],
        categories: ["cat3"],
        services: [],
        companyUser: null,
        companyUserId: null,
      },
      {
        id: "sg4",
        imgSrc: ["https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png"],
        categories: ["cat4"],
        services: [],
        companyUser: null,
        companyUserId: null,
      },
      {
        id: "sg5",
        imgSrc: ["https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png"],
        categories: ["cat5"],
        services: [],
        companyUser: null,
        companyUserId: null,
      },
    {
      id: "sg2",
      imgSrc: ["https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png", "https://pub-7f0b34261a8942cfba2688d40fd2f27d.r2.dev/Rectangle 45 (1).png"],
      categories: ["cat1", "cat2"],
      services: [],
      companyUser: null,
      companyUserId: null,
    },
  ];
  

  const fetchExistingCategories = async (company: CompanyUser) => {
    // ในตัวอย่างนี้เราจะใช้ setTimeout เพื่อจำลองการ delay ของ network request
    return new Promise((resolve) => {
      setTimeout(() => {
        const enrichedCategories = mockGalleryCategories.map(category => {
          return {
            ...category,
            serviceGalleries: category.serviceGalleries.map(serviceGalleryId => {
              return mockServiceGalleries.find(sg => sg.id === serviceGalleryId);
            })
          };
        });
        resolve(enrichedCategories);
      }, 1000); // จำลอง delay 1 วินาที
    });
  };
  
  

const ExistingCategories = ({navigation}: Props) => {
  const [products, setProducts] = useState<Service[]>([]);
  const route = useRoute();
  const {width, height} = Dimensions.get('window');
  const companyID = route.params;

  const {data, isLoading, isError} = useQuery(
    ['existingProduct', companyID],
    () => fetchExistingCategories(companyID as CompanyUser),
    {
      onSuccess: data => {
        setProducts(data);
        console.log('audit data', JSON.stringify(data));
      },
    },
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }
  const handleAddNewProduct = () => {
    navigation.navigate('AddProduct');
  };

  return (
    <View style={styles.container}>
      {products.length > 0 && (
        <Text style={styles.titleText}>เลือกจากรายการเดิม</Text>
      )}
      <FlatList
        data={products.slice(-5)}
        renderItem={({item}) => (
            <View style={styles.Box}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <View style={styles.card}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={item.serviceGalleries[0].imgSrc}
                  renderItem={({item: image}) => (
                    <Image
                      source={{uri: image}}
                      style={styles.productImage}
                    />
                  )}
                  keyExtractor={(img, index) => index.toString()}
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.selectButton}>
                  <Text style={styles.buttonText}>เลือก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.buttonTextEdit}>แก้ไข</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              height: height * 0.5,

              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={handleAddNewProduct}
              style={styles.emptyListButton}>
              <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
            </TouchableOpacity>
          </View>
        }
        keyExtractor={item => item.id}
      />
      {products.length > 0 && (
        <TouchableOpacity
          onPress={handleAddNewProduct}
          style={styles.emptyListButton}>
          <Text style={styles.emptyListText}>+ เพิ่มรายการใหม่</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  titleText: {
    fontSize: 16,
    //   fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,

    borderRadius: 8,
    backgroundColor: '#FFF',

  },
  Box: {
    flexDirection: 'column',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },

  textContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: 'gray',
  },


  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  emptyListButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  selectButton: {
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  editButton: {
    padding: 8,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonTextEdit: {
    color: '#007BFF',
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ExistingCategories;
