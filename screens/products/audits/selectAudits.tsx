import React, {useState, useContext, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity,ScrollView} from 'react-native';
import CardAudit from '../../../components/CardAudit';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {Store} from '../../../redux/store';
import * as stateAction from '../../../redux/actions';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import{ Audit, ServiceList,EditProductList} from '../../../types/docType'
import{ ParamListBase} from '../../../types/navigationType'

type NavigationProps = {
  navigation: StackNavigationProp<ParamListBase, 'SelectAudit'>;
  route: RouteProp<ParamListBase, 'SelectAudit'>;
};
type ComponentProps = {
  title: string;
  description: string;
  onPress?: () => void;
};


const fetchAudits = async (id: string, isEmulator: boolean) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const idToken = await user.getIdToken();
  let url;
  if (isEmulator) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryAudits2`;
  } else {
    console.log('isEmulator Fetch', isEmulator);
    url = `https://asia-southeast1-${PROJECT_FIREBASE}.cloudfunctions.net/appQueryAudits2`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({id}),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

const SelectAudit = ({navigation}: NavigationProps) => {
  const [selectedAudits, setSelectedAudits] = useState<Audit[]>([]);
  const route = useRoute<RouteProp<ParamListBase, 'SelectAudit'>>();
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const [audits, setAudits] = useState<Audit[] | null>(null);

  const { title, description, onPress = () => {} }: ComponentProps = route.params;

  const {
    state: {selectedAudit, companyID, isEmulator},
    dispatch,
  }: any = useContext(Store);
  const {data, isLoading, isError} = useQuery(
    ['queryAudits', companyID],
    () => fetchAudits(companyID, isEmulator).then(res => res),
    {
      onSuccess: data => {
        setAudits(data);
        console.log('audit data', JSON.stringify(data));
      },
    },
  );

  // const audits: Audit[] = [
  //   {
  //     id: 1,
  //     number:101,
  //     title: 'ตรวจเช็คการป้องกันน้ำ',
  //     description: ' การทดสอบการรั่วซึมของน้ำด้วยการฉีดน้ำ(สำหรับงานภายนอกอาคารหรือประตูทางเข้าบ้าน) สัญญาว่างานที่ส่งมอบจะต้องผ่านการทดสอบการฉีดน้ำเพื่อทดสอบการรั่วซึมก่อนส่งมอบงาน หากมีน้ำรั่วซึมเข้าไปภายในบ้านให้ถือว่าการทดสอบนี้ยังไม่ผ่านให้ผู้รับจ้างปรับปรุงแก้ไขจนกระทั่งน้ำไม่สามารถซึมผ่านได้ก่อนที่จะส่งงวดงานหรือเบิกเงินงวดงาน',
  //     imageUri: 'https://res.cloudinary.com/trustworkco/image/upload/v1680677569/gttirwz80fd4vsa11q2k.jpg',
  //   },
  //   {
  //     id: 2,
  //     number:102,
  //     title: 'ตรวจเช็คช่องระหว่างระหว่างขอบประตูทุกบาน',
  //     description: 'ทดสอบช่องระหว่างประตู ต้องปิดสนิทรอบด้าน ตรวจสอบให้แน่ใจว่าปิดประตูสนิทแล้วไม่ควรจะมีรูหรือช่องอากาศที่ตามองเห็นทุกด้านของทุกประตูที่ติดตั้งก่อนเบิกเงินงวดงาน',
  //     imageUri: 'https://res.cloudinary.com/trustworkco/image/upload/v1680680642/aluminium/gpiopwyc5is4pynbvnq7.jpg',
  //   },
  //   {
  //     id: 3,
  //     number:103,
  //     title: 'ตรวจเช็คตำแหน่งความเอียงของประตู',
  //     description: 'ทดสอบตำแหน่งของประตูจะต้องอยู่ในองศาที่ดี ตำแหน่งการติดตั้งไม่เบี้ยวหากตำแหน่งของประตูไม่ได้อยู่ในองศาที่ดีจะต้องแก้ไขให้เรียบร้อยก่อนเบิกงวดงาน',
  //     imageUri: 'https://res.cloudinary.com/trustworkco/image/upload/v1680680851/aluminium/ynpf4mn8cgg4pms2i4xa.jpg',
  //   },
  // ];

  const handleSelectAudit = (audit: Audit) => {
    const existingIndex = selectedAudits.findIndex(
      a => a.title === audit.title,
    );
    if (existingIndex !== -1) {
      // if the audit is already selected, remove it
      setSelectedAudits(selectedAudits.filter(a => a.title !== audit.title));
      dispatch(stateAction.remove_selected_audit(audit));
    } else {
      // if the audit is not selected, add it
      setSelectedAudits([...selectedAudits, audit]);
      dispatch(stateAction.selected_audit(audit));
    }
  };

  const handleDonePress = () => {
    if (selectedAudits.length > 0) {
      // dispatch here
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (selectedAudit.length > 0) {
      setSelectedAudits(selectedAudit);
    }
  }, [selectedAudit]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Lottie
          style={{width: '25%'}}
          source={require('../../../assets/animation/lf20_rwq6ciql.json')}
          autoPlay
          loop
        />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text>ERROR</Text>
      </View>
    );
  }
  const auditsWithChecked =
    audits?.map(audit => ({
      ...audit,
      defaultChecked: selectedAudits.some(a => a.id === audit.id),
    })) || [];


  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
              มาตรฐานงานติดตั้ง {headerText}{' '}
            </Text>
            {/* Text "Window here" */}
          </View>
          {/* Tile & description part */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {showCards ? (
            <View style={styles.cardsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setHeaderText('บานเฟี้ยม');
                  setShowCards(false);
                }}
                style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.title}>Window</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.auditListContainer}>
              {auditsWithChecked.map((audit: any, index: number) => (
                <CardAudit
                  key={index}
                  title={audit.auditShowTitle}
                  description={audit.description}
                  number={audit.number}
                  defaultChecked={audit.defaultChecked}
                  imageUri={audit.image}
                  onPress={() => handleSelectAudit(audit)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {selectedAudits.length > 0 && (
        <View style={styles.containerBtn}>
          <TouchableOpacity onPress={handleDonePress} style={styles.button}>
            <Text
              style={
                styles.buttonText
              }>{`บันทึก ${selectedAudits.length} มาตรฐาน`}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SelectAudit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    backgroundColor: '#EDEDED',
    padding: 10,
    marginBottom: 30,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#323232',

    fontFamily: 'Sukhumvit set',
  },
  titleContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#323232',
  },
  description: {
    fontSize: 16,
    color: '#323232',
    marginTop: 5,
  },
  auditListContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardAudit: {
    height: 200, // Set a fixed height for the CardAudit component
  },
  buttonContainer: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    bottom: 0,
    width: '100%',

    paddingBottom: 30,
  },
  button: {
    width: '90%',
    top: '30%',
    height: 50,
    backgroundColor: '#0073BA',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: '48%',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 40,
    justifyContent: 'space-between',
  },
  cardAuditView: {
    height: 200, // Set a fixed height for the CardAudit component
    marginBottom: 20,
    width: '48%', // To show 2 cards in a row
    borderRadius: 5, // Add rounded corners
    backgroundColor: '#ffffff', // Add a background color
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
