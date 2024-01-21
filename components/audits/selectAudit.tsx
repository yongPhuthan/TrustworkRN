import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {CheckBox} from '@rneui/themed';

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
import {HOST_URL, PROJECT_FIREBASE, BACK_END_SERVER_URL} from '@env';
import {useQuery} from '@tanstack/react-query';
import {
  Audit,
  ServiceList,
  EditProductList,
  AuditData,
} from '../../types/docType';
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  set,
} from 'react-hook-form';

import {ParamListBase} from '../../types/navigationType';
import Modal from 'react-native-modal';
import {useUser} from '../../providers/UserContext';
import {
  Button,
  Text as TextPaper,
  Appbar,
  Checkbox,
  Banner,
} from 'react-native-paper';

interface AuditModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  serviceId: string;
}

const SelectAudit = ({
  isVisible,
  onClose,
  serviceId,
  title,
  description,
}: AuditModalProps) => {
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const user = useUser();
  const [audits, setAudits] = useState<Audit[] | null>(null);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context as any;
  const {
    state: {selectedAudit, companyID, serviceList},
    dispatch,
  }: any = useContext(Store);
  const fetchAudits = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      let url = `${BACK_END_SERVER_URL}/api/services/queryAudits?id=${encodeURIComponent(
        companyID,
      )}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return data;
    }
  };
  const {data, isLoading, isError} = useQuery(
    ['queryAudits', companyID],
    () => fetchAudits().then(res => res),
    {
      onSuccess: data => {
        setAudits(data);
      },
    },
  );

  const handleSelectAudit = (audit: Audit) => {
    const currentAudits = getValues('audits') || [];
    const auditIndex = currentAudits.findIndex(
      auditData => auditData.AuditData.id === audit.id,
    );
    if (auditIndex !== -1) {
      const updatedAudits = [...currentAudits];
      updatedAudits.splice(auditIndex, 1);
      setValue('audits', updatedAudits, {shouldDirty: true});
    } else {
      const updatedAudits = [...currentAudits, {AuditData: audit}];
      setValue('audits', updatedAudits, {shouldDirty: true});
    }
  };

  const handleDonePress = () => {
    if (watch('audits')?.length > 0) {
      onClose();
    }
  };

  const auditsWithChecked =
    audits?.map(audit => ({
      ...audit,
      defaultChecked: audits.some(a => a?.image === audit?.image),
    })) || [];

  useEffect(() => {
    if (auditsWithChecked) {
      setShowCards(false);
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
        <Text>ERROR Audit</Text>
      </View>
    );
  }
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <SafeAreaView style={styles.container}>
      <Appbar.Header
          mode="center-aligned"
          elevated
          style={{
            backgroundColor: 'white',
            width: '100%',
          }}>
          <Appbar.Action icon={'close'} onPress={() => onClose()} />
          <Appbar.Content
            title={`มาตรฐานงานติดตั้ง ${title || ''}`}
            titleStyle={{fontSize: 16}}
          />
        </Appbar.Header>


        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesomeIcon icon={faClose} size={24} color="gray" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              มาตรฐานงานติดตั้ง {headerText}
            </Text>
          </View>

          <Text></Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View> */}
        <FlatList
          style={{padding: 10}}
          data={audits}
          renderItem={({item, index}: any) => (
            <>
              <View
                style={[
                  styles.card,
                  (watch('audits') || []).some(m => m.AuditData.id === item.id)
                    ? styles.cardChecked
                    : null,
                ]}
                // onPress={() => handleSelectAudit(item)}
                
                >
                {/* <CheckBox
                    center
                    checked={(watch('audits') || []).some(
                      audit => audit.AuditData.id === item.id,
                    )}
                    onPress={() => handleSelectAudit(item)}
                    containerStyle={styles.checkboxContainer}
                    checkedColor="#012b20"
                  /> */}

                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',

                  }}>
                  <Checkbox.Item
                    label={item.auditShowTitle}
                    onPress={() => handleSelectAudit(item)}
                    color="#012b20"
                    style={{
                      flexDirection: 'row-reverse',
                    }}
                    status={
                      (watch('audits') || []).some(
                        audit => audit.AuditData.id === item.id,
                      )
                        ? 'checked'
                        : 'unchecked'
                    }

                  />
                  <Image
                    source={{uri: item.auditEffectImage}}
                    style={styles.productImage}
                  />

                  <Text style={styles.description}>{item.content}</Text>
                </View>
              </View>
            </>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                height: height * 0.5,

                alignItems: 'center',
              }}></View>
          }
          keyExtractor={item => item.id}
        />

        {watch('audits').length > 0 && (
          <View style={styles.containerBtn}>
            <Button
              style={{
                width: '90%',
                height: 40,
              }}
              buttonColor="#1b52a7"
              mode="contained"
              onPress={handleDonePress}>
              {`บันทึก ${watch('audits')?.length} รายการ`}{' '}
            </Button>
          </View>
        )}
      </SafeAreaView>
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
    marginTop: 5,
    fontFamily: 'Sukhumvit set',
  },
  titleContainer: {
    padding: 16,

    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  title: {
    fontSize: 16,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'left',
    color: 'black',
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
    backgroundColor: 'transparent',
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
    backgroundColor: '#012b20',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderWidth: 1, // Add border to the card
    borderColor: 'transparent', // Default border color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    height: 'auto',
  },
  cardChecked: {
    borderColor: '#012b20', // Color when checked
  },
  checkboxContainer: {
    padding: 0,
    margin: 0,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
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
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingHorizontal: 10,
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

  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  productImage: {
    width: 125, // Adjust the size according to your design
    height: 125, // Adjust the size according to your design
    borderRadius: 4, // If you want rounded corners
    alignItems: 'center',
  },
});
