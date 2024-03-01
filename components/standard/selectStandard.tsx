import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Store} from '../../redux/store';

import {BACK_END_SERVER_URL} from '@env';
import {useQuery} from '@tanstack/react-query';
import {useFormContext} from 'react-hook-form';
import {Audit, Standard} from '../../types/docType';

import Modal from 'react-native-modal';
import {Appbar, Button, List, Checkbox, Divider} from 'react-native-paper';
import {useUser} from '../../providers/UserContext';

interface AuditModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  serviceId: string;
}

const SelectStandard = ({
  isVisible,
  onClose,
  serviceId,
  title,
  description,
}: AuditModalProps) => {
  const [showCards, setShowCards] = useState(true);
  const [headerText, setHeaderText] = useState('');
  const user = useUser();
  const [standardDatas, setStandardDatas] = useState<Audit[] | null>(null);
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
  const [yourExpanded, setYourExpanded] = React.useState(true);
  const [badExpanded, setBadExpanded] = React.useState(true);

  const handleYourExpandPress = () => setYourExpanded(!yourExpanded);
  const handleBadExpandPress = () => setBadExpanded(!badExpanded);
  const fetchStandards = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    } else {
      const idToken = await user.getIdToken(true);
      let url = `${BACK_END_SERVER_URL}/api/services/queryStandards?id=${encodeURIComponent(
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
    ['queryStandards', companyID],
    () => fetchStandards().then(res => res),
    {
      onSuccess: data => {
        setStandardDatas(data);
      },
    },
  );

  const handleSelectStandard = (standard: Standard) => {
    const currentStandards = getValues('standards') || [];
    const standardIndex = currentStandards.findIndex(
      (standardData: Standard) => standardData.id === standard.id,
    );
    if (standardIndex !== -1) {
      const updatedStandards = [...currentStandards];
      updatedStandards.splice(standardIndex, 1);
      setValue('standards', updatedStandards, {shouldDirty: true});
    } else {
      const updatedStandards = [
        ...currentStandards,
        {
          id: standard.id,
          standardShowTitle: standard.standardShowTitle,
        },
      ];
      setValue('standards', updatedStandards, {shouldDirty: true});
    }
  };

  const handleDonePress = () => {
    if (watch('standards')?.length > 0) {
      onClose();
    }
  };

  const stardardsWithChecked =
    standardDatas?.map(standard => ({
      ...standard,
      defaultChecked: standardDatas.some(a => a?.image === standard?.image),
    })) || [];

  useEffect(() => {
    if (stardardsWithChecked) {
      setShowCards(false);
    }
  }, []);

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
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{
          backgroundColor: 'white',
          width: Dimensions.get('window').width,
        }}>
        <Appbar.Action icon={'close'} onPress={() => onClose()} />
        <Appbar.Content
          title={`มาตรฐานงานติดตั้ง ${title || ''}`}
          titleStyle={{fontSize: 16}}
        />
      </Appbar.Header>
      <SafeAreaView style={styles.container}>
        <FlatList
          style={{padding: 10}}
          data={standardDatas}
          renderItem={({item, index}: any) => (
            <>
              <View
                style={[
                  styles.card,
                  (watch('standards') || []).some(
                    (standard: Standard) => standard.id === item.id,
                  )
                    ? styles.cardChecked
                    : null,
                ]}
                // onPress={() => handleSelectAudit(item)}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    width: '100%',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 'auto',
                    }}>
                    <Checkbox.Android
                      onPress={() => handleSelectStandard(item)}
                      color="#012b20"
                      style={{
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                      }}
                      status={
                        (watch('standards') || []).some(
                          (standard: Standard) => standard.id === item.id,
                        )
                          ? 'checked'
                          : 'unchecked'
                      }
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'black',
                      }}>
                      {item.standardShowTitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center', // Center children horizontally
                      alignItems: 'center', // Center children vertically
                      paddingVertical: 10,
                      width: '100%',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        paddingHorizontal: 10,
                        gap: 20,
                      }}>
                      <View
                        style={{
                          flexDirection: 'column',
                          marginHorizontal: 5,
                        }}>
                        <Image
                          source={{uri: item.image}}
                          style={styles.productImage}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'column',
                          marginHorizontal: 5, // เพิ่ม margin รอบข้างเล็กน้อยเพื่อแยกรูปภาพ
                        }}>
                        <Image
                          source={{uri: item.badStandardImage}}
                          style={styles.productImage}
                        />
                      </View>
                    </View>
                  </View>

                  <View
                    style={{flexDirection: 'column', paddingHorizontal: 10}}>
                    <List.Section>
                      <List.Accordion
                        title="มาตรฐานของคุณ"
                        titleStyle={{fontSize: 16}}
                        left={props => (
                          <List.Icon
                            {...props}
                            icon="check-circle"
                            color="green"
                          />
                        )}
                        style={{width: '100%'}}>
<List.Item title={`${item.content}`} titleNumberOfLines={8}/>
                      </List.Accordion>
                    </List.Section>
                    <List.Section>
                      <List.Accordion
                        title="ตัวอย่างที่ไม่ได้มาตรฐาน"
                        titleStyle={{color: 'red'}}
                        left={props => (
                          <List.Icon
                            {...props}
                            icon="close-circle"
                            color="red"
                          />
                        )}>
                     <List.Item title={`${item.badStandardEffect}`} titleNumberOfLines={8}/>

                      </List.Accordion>
                    </List.Section>
                  </View>
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

        {watch('standards')?.length > 0 && (
          <Button
            style={{
              width: '90%',
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: 20,
            }}
            buttonColor="#1b52a7"
            mode="contained"
            onPress={handleDonePress}>
            {`บันทึก ${watch('standards')?.length} มาตรฐาน`}{' '}
          </Button>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default SelectStandard;
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: 'white',
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
    textAlign: 'center',
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
  },
});
