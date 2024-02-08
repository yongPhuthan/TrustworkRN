import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TextInput, Portal, Modal, Dialog} from 'react-native-paper';

type DatePickerButtonProps = {
  label: string;
  onDateSelected: (date: Date) => void;
  date: string;
  title: string;
};

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const DatePickerButton: React.FC<DatePickerButtonProps> = ({
  label,
  onDateSelected,
  title,
  date,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      onDateSelected(date);
    }
  };
  const today = new Date();
  const sevenDaysFromNow = new Date(
    new Date().setDate(new Date().getDate() + 7),
  );

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.label}>{label}</Text>
        {selectedDate ? (
          <Text style={styles.date}>
            {thaiDateFormatter.format(selectedDate)}
          </Text>
        ) : date == 'today' ? (
          <Text style={styles.date}>{thaiDateFormatter.format(today)}</Text>
        ) : (
          <Text style={styles.date}>
            {thaiDateFormatter.format(sevenDaysFromNow)}
          </Text>
        )}
      </TouchableOpacity>
      {showPicker &&
        (Platform.OS === 'ios' ? (
          <Portal>
            <Dialog
              visible={showPicker}
              onDismiss={() => setShowPicker(false)}
              style={{backgroundColor: 'white', padding: 20}}>
              <Dialog.Title>{title}</Dialog.Title>
              <DateTimePicker
                locale="th-TH"
                value={selectedDate ? selectedDate : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                style={{backgroundColor: 'white'}}
                onChange={handleDateChange}
              />
            </Dialog>
          </Portal>
        ) : (
          <DateTimePicker
            locale="th-TH"
            value={selectedDate ? selectedDate : new Date()}
            mode="date"
            display="default"
            style={{backgroundColor: 'white'}}
            onChange={handleDateChange}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    alignItems: 'center',
    marginBottom: 100,
  },
  modalButtonLabel: {
    color: '#fff',
    fontSize: 18,
  },
});

export default DatePickerButton;
