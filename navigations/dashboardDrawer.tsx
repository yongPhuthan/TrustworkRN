import {faBell} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {createDrawerNavigator,DrawerContentComponentProps} from '@react-navigation/drawer';
import React from 'react';
import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import 'react-native-gesture-handler';
import {Divider, Drawer as PaperDrawer} from 'react-native-paper';
import DashboardContract from '../screens/contract/dashboardContract';
import Dashboard from '../screens/quotation/dashboard';
import {ParamListBase} from '../types/navigationType';

const Drawer = createDrawerNavigator<ParamListBase>();
const commonScreenOptions = {
  headerTitleStyle: {
    fontFamily: 'Sukhumvit Set Bold',
    fontSize: 18,
  },
  headerStyle: {
    backgroundColor: '#ffffff',
  },
  headerTintColor: 'black',
};
function CustomDrawerContent(props:DrawerContentComponentProps) {
  const activeTintColor = 'white'; // Replace with your color for active item
  const inactiveTintColor = 'white'; // Replace with your color for inactive item
  const borderRadius = 3; // Adjust as needed

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          backgroundColor: '#ffffff',
          alignItems: 'flex-start',
        }}>
        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#012b20'}}>
          TRUSTH
        </Text>
      </View>
      <Divider style={{marginBottom: 20}} />
      <PaperDrawer.Section>
        <PaperDrawer.Item
          label="ใบเสนอราคา"
          icon="file-document"
          active={props.state.index === 0}
          onPress={() => props.navigation.navigate('Dashboard')}
          // style={
          //   props.state.index === 0
          //     ? {backgroundColor: activeTintColor, borderRadius: borderRadius}
          //     : {}
          // }
          theme={{
            colors: {
              text: props.state.index === 0 ? 'white' : inactiveTintColor,
            },
          }}
        />
        <PaperDrawer.Item
          label="สัญญา"
          icon="file-document"
          active={props.state.index === 1}
          onPress={() => props.navigation.navigate('DashboardContract')}
        />
      </PaperDrawer.Section>
      <PaperDrawer.Section style={{marginTop: 'auto'}} showDivider={false}>
        <PaperDrawer.Item
          label="ตั้งค่า"
          icon="cog"
          active={props.state.index === 2}
          onPress={() => props.navigation.navigate('SettingsScreen')}
        />
      </PaperDrawer.Section>
    </SafeAreaView>
  );
}

function DashboardDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          ...commonScreenOptions,
          headerShown: false,

          title: 'ใบเสนอราคา',

          headerRight: () => (
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => {
                /* handle press */
              }}>
              <FontAwesomeIcon icon={faBell} color="#1f303cff" size={22} />
            </TouchableOpacity>
          ),
          // ... other common options ...
        }}
      />
      <Drawer.Screen
        name="DashboardContract"
        component={DashboardContract}
        options={{
          ...commonScreenOptions,
          headerShown: false,
          title: 'สัญญา',
          headerRight: () => (
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => {
                /* handle press */
              }}>
              <FontAwesomeIcon icon={faBell} color="#1f303cff" size={22} />
            </TouchableOpacity>
          ),
          // ... other common options ...
        }}
      />


      {/* ... other screens ... */}
    </Drawer.Navigator>
  );
}

export default DashboardDrawer;
