import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card} from 'react-native-paper';
import RenderContent from './RenderTable';

type Props = {
    quotation: any;
};

const ContractDepositCard = (props: Props) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.header}>

          <Text style={styles.headerText}>1. ข้อตกลงว่าจ้าง</Text>
        </Card.Content>
        <Card.Content style={{padding:15}}>
          <Text style={styles.contentText}>
            สถาณที่ติดตั้งงาน : 240 หมู่บ้านแกรนด์พาร์ค ซอยโยธินพัฒนา 3 แยก 6
            แขวงคลองจั่น เขตบางกะปิ จังหวัดกรุงเทพฯ 10240 โทร 095-9962030 . Line
            yong2662
          </Text>
          <RenderContent 
          quotation={props.quotation}
          />
        </Card.Content>
        <Card.Content style={styles.responsibilityCard}>
          <Text style={styles.boldText}>ความรับผิดชอบของผู้รับจ้าง :</Text>
          <Text style={styles.contentText}>
            240 หมู่บ้านแกรนด์พาร์ค ซอยโยธินพัฒนา 3 แยก 6 แขวงคลองจั่น
            เขตบางกะปิ จังหวัดกรุงเทพฯ 10240 โทร 095-9962030 . Line yong2662
          </Text>
        </Card.Content>
        <Card.Content style={styles.responsibilityCardAlt}>
          <Text style={styles.boldText}>ความรับผิดชอบของผู้ว่าจ้าง :</Text>
          <Text style={styles.contentText}>
            240 หมู่บ้านแกรนด์พาร์ค ซอยโยธินพัฒนา 3 แยก 6 แขวงคลองจั่น
            เขตบางกะปิ จังหวัดกรุงเทพฯ 10240 โทร 095-9962030 . Line yong2662
          </Text>
        </Card.Content>

      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 5,
  },
  card: {
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#000',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#428398',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  headerNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentText: {
    fontSize: 22,
  },
  responsibilityCard: {
    backgroundColor: '#FFDCDC',
    borderRadius: 3,
    marginTop: 8,
    padding: 16,
  },
  responsibilityCardAlt: {
    backgroundColor: '#fff3db',
    borderRadius: 15,
    marginTop: 8,
    padding: 16,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default ContractDepositCard;
