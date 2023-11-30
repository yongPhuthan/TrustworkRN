import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import {
    faCloudUpload,
    faEdit,
    faPlus,
    faImages,
    faClose,
  } from '@fortawesome/free-solid-svg-icons';
  import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import CardAudit from '../../components/CardAudit';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {Store} from '../../redux/store';
import * as stateAction from '../../redux/actions';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {HOST_URL, PROJECT_FIREBASE, PROD_API_URL} from '@env';
import {useQuery} from '@tanstack/react-query';
import Lottie from 'lottie-react-native';
import {Audit, ServiceList, EditProductList} from '../../types/docType';
import {ParamListBase} from '../../types/navigationType';
import Modal from 'react-native-modal';

interface AuditModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedAudits: Audit[];
  setSelectedAudits: React.Dispatch<React.SetStateAction<Audit[]>>;
  title?: string;
  description?: string;
  onPress?: () => void;
}

const fetchAudits = async (id: string, isEmulator: boolean) => {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const idToken = await user.getIdToken();
  let url;
  if (__DEV__) {
    url = `http://${HOST_URL}:5001/${PROJECT_FIREBASE}/asia-southeast1/appQueryAudits2`;
  } else {
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

const SelectAudit = ({
  isVisible,
  onClose,
  selectedAudits,
  setSelectedAudits,
  title,
  description,
  onPress,
}: AuditModalProps) => {
  //   const [selectedAudits, setSelectedAudits] = useState<Audit[]>([]);
  const route = useRoute<RouteProp<ParamListBase, 'SelectAudit'>>();
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const [audits, setAudits] = useState<Audit[] | null>(null);
  //   const { title, description, onPress = () => {} }: ComponentProps = route.params;

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
     onClose();
    }
  };
  const transformedData = selectedAudits.map(item => item.AuditData);

  const auditsWithChecked =
  audits?.map(audit => ({
    ...audit,
    defaultChecked: transformedData.some(a => a?.image === audit?.image),
  })) || [];

  useEffect(() => {
    if (selectedAudit.length > 0) {
      setSelectedAudits(selectedAudit);
    }
    if(auditsWithChecked ){
      setShowCards(false)
  
    }
  }, [selectedAudit]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
      <ActivityIndicator />
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

  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesomeIcon icon={faClose} size={32} color="gray" />            
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                มาตรฐานงานติดตั้ง {headerText}
              </Text>
            </View>
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
                {auditsWithChecked?.map((audit: any, index: number) => (
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
    </Modal>
  );
};

export default SelectAudit;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    width,
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
    height: 200,
    marginBottom: 20,
    width: '48%',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingTop: 30,
    backgroundColor: '#f5f5f5',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',

  
  },
  closeButton: {
    paddingVertical: 10,

  },
});
