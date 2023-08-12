import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

type Props = {
  quotation: any;
};

type InstallmentData = {
  งวดที่: string;
  ชำระเมื่อ: string;
  เปอร์เซ็น: string;
  จำนวน: string;
};


const RenderContent: React.FC<Props> = (props) => {
  const installmentData: InstallmentData[] = [];

  for (let i = 0; i < props.quotation.periodPercent.length; i++) {
    const installment = props.quotation.periodPercent[i].installment;
    const amount = props.quotation.periodPercent[i].amount;
    const percentage = props.quotation.periodPercent[i].percentage;
    const details = props.quotation.periodPercent[i].details;

    installmentData.push({
      งวดที่: `ชำระงวดที่ ${installment}`,
      ชำระเมื่อ: details,
      เปอร์เซ็น: percentage,
      จำนวน: amount,
    });
  }

  const renderRow = ({ item, index }: { item: InstallmentData; index: number }) => (
    <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#fbfbfb' : 'white' }]}>
      <View style={styles.cellContainer}>
        <Text style={styles.cellLabel}>งวดที่</Text>
        <Text style={styles.cell}>{item['งวดที่']}</Text>
      </View>
      <View style={styles.cellContainer}>
        <Text style={styles.cellLabel}>ชำระเมื่อ</Text>
        <Text style={styles.cell}>{item['ชำระเมื่อ']}</Text>
      </View>
      <View style={styles.cellContainer}>
        <Text style={styles.cellLabel}>เปอร์เซ็น</Text>
        <Text style={styles.cell}>{item['เปอร์เซ็น']}</Text>
      </View>
      <View style={styles.cellContainer}>
        <Text style={styles.cellLabel}>จำนวน</Text>
        <Text style={styles.cell}>{item['จำนวน']}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={installmentData}
        renderItem={renderRow}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  row: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  cellContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cellLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16325C',
  },
  cell: {
    fontSize: 16,
    textAlign: 'left',
  },
});

export default RenderContent;
