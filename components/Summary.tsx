import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  Switch,
  TextInput
} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import SmallDivider from './styles/SmallDivider';
import {
  useForm,
  Controller,
  useFormContext,
  useWatch,
  set,
} from 'react-hook-form';
import Decimal from 'decimal.js-light';
import { List, Text as TextPaper} from 'react-native-paper';

const windowWidth = Dimensions.get('window').width;

type Props = {
  vat7Props: boolean;
  taxProps: number;
  pickerTaxProps: boolean;
};

const Summary = ({vat7Props, taxProps, pickerTaxProps}: Props) => {
  const [selectedValue, setSelectedValue] = useState(taxProps);
  const [pickerVisible, setPickerVisible] = useState(pickerTaxProps);
  const [discount, setDiscount] = useState('0');
  const [vat7Picker, setVat7Picker] = useState(vat7Props);
  const [vat7Value, setVat7Value] = useState(0);
  const context = useFormContext();
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: {errors},
  } = context as any;

  const onDiscountInputChange = (value: string) => {
    if (value === '') {
      setDiscount('0');
    } else if (/^\d+%?$/.test(value)) {
      setDiscount(value);
    }
  };

  const data = [
    {label: '3%', value: 3},
    {label: '5%', value: 5},
  ];
  const discountPercentage = useWatch({
    control,
    name: 'discountPercentage',
  });
  const summary = useWatch({
    control,
    name: 'summary',
  });

  const services = useWatch({
    control,
    name: 'services',
  });
  const discountValue = useWatch({
    control,
    name: 'discountValue',
  });

  const summaryAfterDiscount = useWatch({
    control,
    name: 'summaryAfterDiscount',
  });

  const vat7 = useWatch({
    control,
    name: 'vat7',
  });
  const allTotal = useWatch({
    control,
    name: 'allTotal',
  });

  const taxType = useWatch({
    control,
    name: 'taxType',
  });
  const taxValue = useWatch({
    control,
    name: 'taxValue',
  });  
  useEffect(() => {
    const sum = services.reduce((acc, curr) => {
      const total = curr.total ? new Decimal(curr.total) : new Decimal(0);
      return new Decimal(acc).plus(total);
    }, new Decimal(0));

    const parsedDiscountPercentage = discountPercentage
      ? new Decimal(discountPercentage)
      : new Decimal(0);
    const calculatedDiscountValue = sum
      .times(parsedDiscountPercentage)
      .div(100);

    const calculatedSummaryAfterDiscount = sum.minus(calculatedDiscountValue);

    let taxType = 'NOTAX';
    let taxValue = new Decimal(0);
    const vat7Amount = vat7Picker
      ? calculatedSummaryAfterDiscount.times(0.07)
      : new Decimal(0);

    if (pickerVisible && selectedValue) {
      switch (selectedValue) {
        case 3:
          taxType = 'TAX3';
          taxValue = calculatedSummaryAfterDiscount.times(0.03);
          break;
        case 5:
          taxType = 'TAX5';
          taxValue = calculatedSummaryAfterDiscount.times(0.05);
          break;
      }
    }

    const finalTotal = calculatedSummaryAfterDiscount
      .plus(vat7Amount)
      .minus(taxValue);
    setValue('vat7', vat7Amount.toFixed(2), {shouldDirty: true});
    setValue('taxType', taxType, {shouldDirty: true});
    setValue('taxValue', taxValue.toFixed(2), {shouldDirty: true});
    setValue('discountValue', calculatedDiscountValue.toFixed(2), {
      shouldDirty: true,
    });
    setValue('summary', sum.toFixed(2), {shouldDirty: true});
    setValue(
      'summaryAfterDiscount',
      calculatedSummaryAfterDiscount.toFixed(2),
      {shouldDirty: true},
    );
    setValue('allTotal', finalTotal.toFixed(2), {shouldDirty: true});
  }, [services, discountPercentage, vat7Picker, pickerVisible, selectedValue]);
  
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ยอดรวม</Text>
        <Text style={styles.summaryPrice}>
          {new Intl.NumberFormat().format(summary)}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดรวม</Text>
        <View style={styles.inputWrapper}>
        <Controller
  control={control}
  name="discountPercentage"
  defaultValue={0}
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      style={styles.input}
      placeholder="0"
      onBlur={onBlur}
      keyboardType="number-pad"
      onChangeText={(newValue) => {
        // Convert newValue to a number before passing to onChange if needed
        const numericValue = newValue ? parseFloat(newValue) : 0;
        onChange(numericValue);
      }}
      value={value.toString()} // Convert the value to a string
    />
  )}
/>

          <Text style={styles.summaryText}>%</Text>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ส่วนลดเป็นเงิน</Text>
        <Text style={styles.summaryPrice}>
          {new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(new Decimal(discountValue).toNumber())}
        </Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>ยอดรวมหลังหักส่วนลด</Text>
        <Text style={styles.summaryPrice}>
          {new Intl.NumberFormat().format(summaryAfterDiscount)}
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
            {new Intl.NumberFormat().format(taxValue)}
          </Text>
        </View>
      )}

      {/* <SmallDivider /> */}

      <View style={styles.summary}>
        <Text style={[styles.summaryTaxVat]}>ภาษีมูลค่าเพิ่ม </Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={pickerVisible ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setVat7Picker(!vat7Picker)}
          value={vat7Picker}
          style={[
            {},
            Platform.select({
              ios: {
                transform: [{scaleX: 0.7}, {scaleY: 0.7}],
              },
              android: {
                transform: [{scaleX: 1}, {scaleY: 1}],
              },
            }),
          ]}
        />
      </View>
      {vat7Picker && (
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
            {new Intl.NumberFormat('th-TH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(new Decimal(vat7).toNumber())}
          </Text>
        </View>
      )}
      <View style={styles.summaryTotal}>
        <TextPaper variant="headlineMedium">รวม</TextPaper>
        <TextPaper variant="headlineMedium">
          {new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(new Decimal(allTotal).toNumber())}
        </TextPaper>
      </View>
    </View>
  );
};

export default Summary;

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#19232e',
  },
  summaryTax: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    color: '#19232e',
  },
  summaryTotal: {
    flexDirection: 'row',
    marginBottom: 10,
    marginVertical:20,
    justifyContent: 'space-between',
    color: '#19232e',
  },
  container: {
    // width: windowWidth * 0.7,
    // alignSelf: 'flex-end',

    width: windowWidth * 0.85,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
  },
  summaryTaxVat: {
    fontSize: 16,
    marginVertical: 10,
    color: '#19232e',
  },
  totalSummary: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#19232e',
  },
  summaryPrice: {
    fontSize: 18,
    marginVertical: 10,
    color: '#19232e',
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
    color: '#19232e',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#19232e',
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
    paddingRight: 30,
  },

  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});
