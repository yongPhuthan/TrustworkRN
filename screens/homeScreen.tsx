import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  NativeModules,
} from 'react-native';
import {NavigationScreen} from '../types/navigationType';
import React, {useState, useEffect, useContext} from 'react';
import {Badge} from '@rneui/themed';
import {HOST_URL, PROJECT_NAME} from '@env';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useQuery} from '@tanstack/react-query';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faFile,
  faDrawPolygon,
  faCog,
  faBell,
  faChevronRight,
  faCashRegister,
  faCoins,
  faSign,
  faFileCirclePlus,
  faSignature,
} from '@fortawesome/free-solid-svg-icons';
import useTokenAndEmail from '../hooks/user/useTokenAndEmail';
import {Store} from '../redux/store';
import Dashboard from './quotation/dashboard';
import ContractDashboard from './contract/dashboard';
import SettingsScreen from './setting/setting';

type Props = {};

const HomeScreen = ({navigation}: NavigationScreen) => {
  const Tab = createBottomTabNavigator();
  let docApproved = 0;
  const user = useTokenAndEmail();

  const {
    state: {isEmulator},
    dispatch,
  }: any = useContext(Store);
  const fetchDocApproved = async (user) => {

    const url = __DEV__
      ? `http://${HOST_URL}:5001/${PROJECT_NAME}/asia-southeast1/queryDocApproved`
      : `https://asia-southeast1-${PROJECT_NAME}.cloudfunctions.net/queryDocApproved`;

    if (user) {
      console.log('user', user);
      const {token, email} = user;

      if (email) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        });
        const data = await response.json();
        if (data && data[1]) {
          data[1].sort((a: any, b: any) => {
            const dateA = new Date(a.dateOffer);
            const dateB = new Date(b.dateOffer);
            return dateB.getTime() - dateA.getTime();
          });
        }
        return data;
      }
    }
  };
  const [docQty, setDocQty] = useState(0);
  const {isLoading, error, data} = useQuery(
    ['contractDashboardData'],
    () => fetchDocApproved(user), 
    {
      enabled: !!user,
      onSuccess: data => {
        console.log('DATA LG', data);

        setDocQty(data);
      },
    },
  );

  const BadgeComponent = () => (
    <View style={{position: 'absolute', right: -6, top: -3}}>
      <Badge value={docQty} status="error" />
    </View>
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0c5caa',
          tabBarInactiveTintColor: 'gray',
          tabBarItemStyle: {
            borderTopWidth: 3,
            borderTopColor: 'transparent',
          },
          tabBarLabelStyle: {fontSize: 14},
          tabBarLabelPosition: 'below-icon',
        }}>
        <Tab.Screen
          name="เสนอราคา"
          options={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitle: '',
            headerLeft: () => (
              <Text
                style={{
                  color: '#042d60',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginLeft: 10,
                }}>
                Trustwork
              </Text>
            ),
            headerRight: () => (
              <TouchableOpacity>
                <FontAwesomeIcon
                  icon={faBell}
                  color="gray"
                  size={28}
                  style={{marginRight: 15}}
                />
              </TouchableOpacity>
            ),
            tabBarIcon: ({color, size}) => (
              <FontAwesomeIcon icon={faFile} color={color} size={size} />
            ),
          }}
          component={Dashboard}
        />
        <Tab.Screen
          name="สัญญา"
          options={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitle: '',

            headerTintColor: '#000',
            headerLeft: () => (
              <Text
                style={{
                  color: '#042d60',
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginLeft: 10,
                }}>
                Trustwork
              </Text>
            ),
            headerRight: () => (
              <TouchableOpacity>
                <FontAwesomeIcon
                  style={{marginRight: 15}}
                  icon={faBell}
                  color="gray"
                  size={28}
                />
              </TouchableOpacity>
            ),
            tabBarIcon: ({color, size}) => (
              <View>
                <FontAwesomeIcon icon={faSignature} color={color} size={size} />
                {docQty > 0 && <BadgeComponent />}
              </View>
            ),
          }}
          component={ContractDashboard}
        />
        <Tab.Screen
          name="ตั้งค่า"
          options={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitle: 'ตั้งค่าธุรกิจ',

            headerTintColor: '#000',
            tabBarIcon: ({color, size}) => (
              <FontAwesomeIcon icon={faCog} color={color} size={size} />
            ),
          }}
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
