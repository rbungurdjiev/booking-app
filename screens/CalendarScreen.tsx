import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBookings } from '../contexts/BookingContext';

const SERVICES = [
  { id: '1', name: "Депилација Цели Нози + Раци", price:  800 },
  { id: '2', name: "Депилација Цели Нози + Препони", price: 600 },
  { id: '3', name: "Депилација Раци", price: 400 },
  { id: '4', name: "Депилација Препони", price: 350 },
  { id: '5', name: "Депилација Пола Нози + Препони", price: 500 },
  { id: '6', name: "Депилација Лице", price: 150 },
  { id: '7', name: "Депилација Веги", price: 100 },
  { id: '8', name: "Нокти Гел", price: 600 },
  { id: '9', name: "Шминка", price: 500 },
  { id: '10', name: "Педикир", price: 500 },
  { id: '11', name: "Нокти Гел - Нози", price: 400 },
  { id: '12', name: "Педикир + Гел", price: 800 },
];

export default function CalendarScreen() {
  const { addBooking } = useBookings();
  const [selectedDate, setSelectedDate] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 30 * 60000)); // Default 30 min
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowBookingModal(true);
  };

  const handleServiceSelection = (service: any) => {
    setSelectedService(service);
    Alert.alert(
      "Service Selected",
      `You have selected ${service.name} ($${service.price})`,
      [{ text: "OK" }]
    );
  };

  const handleStartTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
      // Set end time to 30 minutes after start time
      setEndTime(new Date(selectedTime.getTime() + 30 * 60000));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const handleBooking = async () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter customer name");
      return;
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const newBooking = {
      id: Date.now().toString(),
      date: selectedDate,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      customerName: customerName.trim(),
      service: {
        id: selectedService.id,
        name: selectedService.name,
        price: selectedService.price
      }
    };

    try {
      await addBooking(newBooking);
      Alert.alert(
        "Success",
        `Appointment booked for ${customerName}\nDate: ${selectedDate}\nTime: ${formatTime(startTime)} - ${formatTime(endTime)}\nService: ${selectedService.name}`,
        [{ 
          text: "OK", 
          onPress: () => {
            setShowBookingModal(false);
            setCustomerName('');
            setStartTime(new Date());
            setEndTime(new Date(Date.now() + 30 * 60000));
          }
        }]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert("Error", "Failed to save booking");
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#2196F3' }
        }}
      />

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Text style={styles.dateText}>Date: {selectedDate}</Text>

            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Text style={styles.sectionTitle}>Select Service:</Text>
            <ScrollView style={styles.servicesContainer}>
              {SERVICES.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceButton,
                    selectedService.id === service.id && styles.selectedService
                  ]}
                  onPress={() => handleServiceSelection(service)}
                >
                  <Text style={[
                    styles.serviceText,
                    selectedService.id === service.id && styles.selectedServiceText
                  ]}>
                    {service.name} ({service.price} Денари)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.timeSelectionContainer}>
              <Text style={styles.sectionTitle}>Select Time:</Text>
              <View style={styles.timeButtonsContainer}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text>Start: {startTime.toLocaleTimeString().slice(0, -3)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text>End: {endTime.toLocaleTimeString().slice(0, -3)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                onChange={handleStartTimeChange}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                onChange={handleEndTimeChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.bookButton]}
                onPress={handleBooking}
              >
                <Text style={styles.buttonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a73e8',
  },
  serviceButton: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  selectedService: {
    backgroundColor: '#FF69B4',
  },
  serviceText: {
    fontSize: 14,
    color: '#FF69B4',
  },
  selectedServiceText: {
    color: '#FFF',
  },
  timeButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '45%',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  timeSelectionContainer: {
    marginVertical: 15,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  servicesContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  actionButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFB6C1',
  },
  bookButton: {
    backgroundColor: '#FF69B4',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 