import React, {useState, useContext, useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import CheckBox from 'react-native-check-box';
import {Store} from '../redux/store';
type CardProps = {
  title: string;
  description: string;
  number: number;
  imageUri: string;
  onPress: Function;
  defaultChecked: boolean;
};

const CardAudit = ({
  title,
  description,
  number,
  imageUri,
  onPress,
  defaultChecked,
}: CardProps) => {
  const {
    state: {selectedAudit},
  }: any = useContext(Store);
  const [checked, setChecked] = useState(defaultChecked);

  const handleCheckbox = () => {
    setChecked(!checked);
    onPress();
  };
  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);
  return (
    <View style={[styles.container, checked && styles.selected]}>
      <View style={styles.checkboxContainer}>
      <CheckBox
          isChecked={checked}
          onClick={handleCheckbox}
          checkBoxColor='gray' // iOS default blue color
        />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {/* <Text style={styles.title}>{defaultChecked.toString()}</Text> */}

          {/* <Text style={styles.price}>{price}</Text> */}
        </View>
        <View style={styles.underline} />
        <Image style={styles.image} source={{uri: imageUri}} />

        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};
export default CardAudit;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selected: {
    backgroundColor: '#F2F2F2',
  },
  checkboxContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: 230,
    height: 250,
  
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6C00',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginTop:10
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    marginVertical: 8,
  },
});
