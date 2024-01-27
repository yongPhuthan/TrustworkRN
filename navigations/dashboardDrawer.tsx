import React from 'react';
import Dashboard from '../screens/quotation/dashboard';
import {TouchableOpacity, View, Text} from 'react-native';
import 'react-native-gesture-handler';
import {Divider, Drawer as PaperDrawer} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBell} from '@fortawesome/free-solid-svg-icons';
import DefaultContract from '../screens/contract/defaultContract';
import {ParamListBase} from '../types/navigationType';
import SettingsScreen from '../screens/setting/setting';
import ExistingContract from '../screens/contract/existingContract';
import {createDrawerNavigator} from '@react-navigation/drawer';

const Drawer = createDrawerNavigator<ParamListBase>();
const commonScreenOptions = {
  headerTitleStyle: {
    fontFamily: 'Sukhumvit Set Bold',
  },
  headerStyle: {
    backgroundColor: '#ffffff',
  },
  headerTintColor: 'black',
};
function CustomDrawerContent(props) {
  const activeTintColor = 'white'; // Replace with your color for active item
  const inactiveTintColor = 'white'; // Replace with your color for inactive item
  const borderRadius = 3; // Adjust as needed

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 20,
          backgroundColor: '#ffffff',
          alignItems: 'flex-start',
        }}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#1b72e8'}}>
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
          style={
            props.state.index === 0
              ? {backgroundColor: activeTintColor, borderRadius: borderRadius}
              : {}
          }
          theme={{
            colors: {
              text: props.state.index === 0 ? 'white' : inactiveTintColor,
            },
          }}
        />
        <PaperDrawer.Item
          label="ทำสัญญา"
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
    </View>
  );
}

function DashboardDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          ...commonScreenOptions,
          headerShown: true,
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
        name="ExistingContract"
        component={ExistingContract}
        options={{
          ...commonScreenOptions,
          headerShown: false,
          title: 'สัญญาใจ',
        }}
      />
      {/* ... other screens ... */}
    </Drawer.Navigator>
  );
}

export default DashboardDrawer;
