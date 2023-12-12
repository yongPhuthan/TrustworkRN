import React, {useState, useContext, useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {CheckBox} from '@rneui/themed';
import {Store} from '../redux/store';
type CardProps = {
  title: string;
  description: string;
  number: number;
  imageUri: string;
  onPress: Function;
  defaultChecked: boolean;
  content: string;
};

const CardAudit = ({
  title,
  description,
  number,
  imageUri,
  content,
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
      <View style={styles.titleContainer}>
        <CheckBox
          checked={checked}
          onPress={handleCheckbox}
          checkedColor="#012b20"
        />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.underline} />
      <Text style={styles.description}>{content}</Text>
  
      <Image style={styles.image} source={{uri: imageUri}} />
    </View>
  );
  
};
export default CardAudit;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 10, 
  },
  selected: {
    borderColor: '#012b20',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, 
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1, 
    marginLeft: 10, // Add space between checkbox and title
  },
  description: {
    fontSize: 14,
    marginBottom: 10, // Add some space below the description
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    marginBottom: 10, // Adjust space below the line
  },
  image: {
    width: '100%', // Adjust to take full width
    height: 250,
    resizeMode: 'contain', // Ensure the image fits within the dimensions
  },
});

