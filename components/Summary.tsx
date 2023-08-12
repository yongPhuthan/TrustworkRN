import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import Divider from './styles/Divider';
import SmallDivider from './styles/SmallDivider';

type Props = {
  title: string;
  price: number;
  onValuesChange: (
    total: number,
    discountValue: number,
    sumAfterDiscount: number,
    vat7Amount: number,
    vat3Amount: number,
  ) => void;
};

const windowWidth = Dimensions.get('window').width;

const Summary = (props: Props) => {
  const [selectedValue, setSelectedValue] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [discount, setDiscount] = useState('0');
  const [vat7, setVat7] = useState(false);
  const [vat7Value, setVat7Value] = useState(0);

  const onDiscountInputChange = (value: string) => {
    if (value === '') {
      setDiscount('0');
    } else if (/^\d+%?$/.test(value)) {
      setDiscount(value);
    }
  };

  const data = [
    {label: '0%', value: 0},
    {label: '3%', value: 3},
    {label: '5%', value: 5},
  ];

  const discountValue = (props.price * parseFloat(discount)) / 100;
  const sumAfterDiscount = props.price - discountValue;
  const vat7Amount = vat7 ? sumAfterDiscount * 0.07 : 0;
  const vat3Amount = pickerVisible
    ? (sumAfterDiscount * Number(selectedValue)) / 100
    : 0;
  const total = Number(sumAfterDiscount + vat7Amount - vat3Amount);

  useEffect(() => {
    props.onValuesChange(
      total,
      discountValue,
      sumAfterDiscount,
      vat7Amount,
      vat3Amount,
    );
  }, [total, discountValue, sumAfterDiscount, vat7Amount, vat3Amount]);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{props.title}</Text>
        <Text style={styles.summaryPrice}>
          {Number(props.price)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดรวม</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="0"
            onChangeText={onDiscountInputChange}
            keyboardType="numeric"
          />
          <Text style={styles.summaryText}>%</Text>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดเป็นเงิน</Text>
        <Text style={styles.summaryPrice}>
          {Number(discountValue)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ยอดรวมหลังหักส่วนลด</Text>
        <Text style={styles.summaryPrice}>
          {Number(sumAfterDiscount)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
      <SmallDivider />
      <View style={styles.summary}>
        <Text style={styles.summaryTaxVat}>หัก ณ ที่จ่าย</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setPickerVisible(!pickerVisible)}
          value={pickerVisible}
          style={Platform.select({
            ios: {
              transform: [{scaleX: 0.7}, {scaleY: 0.7}],
              marginTop: 5,
            },
            android: {},
          })}
        />
      </View>
      {pickerVisible && (
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerAndroidContainer}>
            <RNPickerSelect
              onValueChange={value => setSelectedValue(value)}
              items={data}
              value={selectedValue}
              style={pickerSelectStyles}
            />
          </View>
          <Text style={styles.summaryText}>
            {Number(vat3Amount.toFixed(2))
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
          </Text>
        </View>
      )}

      <SmallDivider />

      <View style={styles.summary}>
        <Text style={[styles.summaryTaxVat]}>ภาษีมูลค่าเพิ่ม </Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setVat7(!vat7)}
          value={vat7}
          style={[
            {},
            Platform.select({
              ios: {
                transform: [{scaleX: 0.7}, {scaleY: 0.7}],
              },
              android: {},
            }),
          ]}
        />
      </View>
      {vat7 && (
        <View style={styles.pickerWrapper}>
          <Text style={styles.summaryText}> 7 % </Text>

          <Text
            style={Platform.select({
              ios: {
                fontSize: 16,
              },
              android: {
                fontSize: 16,
                marginVertical: 10,
              },
            })}>
            {Number(vat7Amount.toFixed(2))
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
          </Text>
        </View>
      )}
      <SmallDivider />
      <View style={styles.summaryTotal}>
        <Text style={styles.totalSummary}>รวมทั้งสิ้น</Text>
        <Text style={styles.totalSummary}>
          {Number(total)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
        </Text>
      </View>
    </View>
  );
};

export default Summary;

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTax: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  summaryTotal: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  container: {
    // width: windowWidth * 0.7,
        // alignSelf: 'flex-end',

        width: windowWidth * 0.85 ,

  },
  summaryText: {
    fontSize: 16,
    marginVertical: 10,
  },
  summaryTaxVat: {
    fontSize: 16,
    marginVertical: 10,
  },
  totalSummary: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  summaryPrice: {
    fontSize: 18,
    marginVertical: 10,
  },
  pickerContainer: {
    flex: 1,
    height: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    height: 40,
    width: 100,
  },
  vat3Container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  pickerAndroidContainer: {
    borderWidth: 0.2,
    borderColor: 'gray',
    height: 40,
    borderRadius: 5,
    backgroundColor: 'white',
    width: 120,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    textAlign: 'right',
    height: '100%',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },

  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
