import { BACK_END_SERVER_URL } from '@env';
import {
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useQuery } from '@tanstack/react-query';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import CardAudit from '../../../../components/CardAudit';
import { useUser } from '../../../../providers/UserContext';
import { Store } from '../../../../redux/store';
import { Audit } from '../../../../types/docType';

interface AuditModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  serviceIndex: number;
}

const SelectAudit = ({
  isVisible,
  onClose,
  serviceIndex,
  title,
  description,
}: AuditModalProps) => {
  const context = useFormContext();
  const {register, control, getValues,watch,setValue} = context;
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const user = useUser();
  const [audits, setAudits] = useState<Audit[] | null>(null);

  const service = useMemo(() => {
    return watch(`services[${serviceIndex}]`);
  }, [watch]);
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
  
  const handleSelectAudit = (audit) => {
    const auditsPath = `services[${serviceIndex}].audits`;
    const currentAudits = getValues(auditsPath) || [];

    const auditIndex = currentAudits.findIndex(auditData => auditData.AuditData.id === audit.id);
  
    if (auditIndex >= 0) {
      // Audit exists, so remove it
      const updatedAudits = currentAudits.filter((_, index) => index !== auditIndex);
      setValue(auditsPath, updatedAudits, {shouldDirty: true});
    } else {
      // Audit does not exist, so add it
      const newAuditData = {
        AuditData: {
          ...audit // Assuming 'audit' has the structure needed for 'AuditData'
        }
        
      };
      const updatedAudits = [...currentAudits, newAuditData];
      setValue(auditsPath, updatedAudits,{shouldDirty: true});
      console.log('serviceAFTER', watch(`services[${serviceIndex}]`));

    }
  };
  
  const handleDonePress = () => {
    if (service?.audits.length > 0) {
      onClose();
    }
  };

  const auditsWithChecked =
    audits?.map(audit => ({
      ...audit,
      defaultChecked: audits.some(a => a?.image  === audit?.image),
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
        <Text>ERROR</Text>
      </View>
    );
  }
  return (
    <Modal isVisible={isVisible} style={styles.modal} onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
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
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
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
                {audits?.map((audit: any, index: number) => (
                  <CardAudit
                    key={index}
                    title={audit.auditShowTitle}
                    content={audit.content}
                    description={audit.description}
                    number={audit.number}
                    defaultChecked={
                      (service.audits || []).some(
                        auditData => auditData.AuditData.id === audit.id,
                      ) 
                    }
                    imageUri={audit.auditEffectImage}
                    onPress={() => handleSelectAudit(audit)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {service.audits?.length > 0 && (
          <View style={styles.containerBtn}>
            <TouchableOpacity onPress={handleDonePress} style={styles.button}>
              <Text
                style={
                  styles.buttonText
                }>{`บันทึก ${service?.audits?.length} มาตรฐาน`}</Text>
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
    marginTop: 5,
    fontFamily: 'Sukhumvit set',
  },
  titleContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
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
});
