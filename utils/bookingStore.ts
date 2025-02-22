import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Booking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  service: {
    name: string;
    price: number;
  };
}

export const saveBooking = async (booking: Booking) => {
  try {
    const existingBookingsJSON = await AsyncStorage.getItem('bookings');
    let existingBookings: Booking[] = [];
    
    if (existingBookingsJSON) {
      try {
        existingBookings = JSON.parse(existingBookingsJSON);
      } catch (parseError) {
        console.error('Error parsing existing bookings:', parseError);
      }
    }
    
    if (!Array.isArray(existingBookings)) {
      existingBookings = [];
    }
    
    const updatedBookings = [...existingBookings, booking];
    await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
    console.log('Booking saved successfully:', booking);
    console.log('All bookings:', updatedBookings);
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsJSON = await AsyncStorage.getItem('bookings');
    if (!bookingsJSON) return [];
    
    const bookings = JSON.parse(bookingsJSON);
    if (!Array.isArray(bookings)) return [];
    
    console.log('Retrieved bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}; 