import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeeklyStats, getMonthlyStats, calculateServiceStats } from '../utils/helpers';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export const SERVICES = [
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

export interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  service: {
    id: string;
    name: string;
    price: number;
  };
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => Promise<void>;
  refreshBookings: () => Promise<void>;
  getRevenueStats: () => {
    daily: number;
    weekly: number;
    monthly: number;
  };
  getServiceStats: () => {
    mostBooked: {
      weekly: { service: string; count: number };
      monthly: { service: string; count: number };
    };
    mostRevenue: {
      weekly: { service: string; revenue: number };
      monthly: { service: string; revenue: number };
    };
  };
  updateBooking: (booking: Booking) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const refreshBookings = useCallback(async () => {
    try {
      const storedBookings = await AsyncStorage.getItem('bookings');
      console.log('Stored bookings:', storedBookings);
      if (storedBookings) {
        const parsedBookings = JSON.parse(storedBookings);
        console.log('Parsed bookings:', parsedBookings);
        setBookings(parsedBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }, []);

  const addBooking = async (newBooking: Booking) => {
    try {
      const storedBookings = await AsyncStorage.getItem('bookings');
      const existingBookings = storedBookings ? JSON.parse(storedBookings) : [];
      const updatedBookings = [...existingBookings, newBooking];
      
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      console.log('Booking saved:', newBooking);
      console.log('All bookings:', updatedBookings);
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  };

  const getRevenueStats = () => {
    const now = new Date();
    const todayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return isWithinInterval(bookingDate, {
        start: startOfDay(now),
        end: endOfDay(now)
      });
    });

    const weeklyBookings = getWeeklyStats(bookings);
    const monthlyBookings = getMonthlyStats(bookings);

    return {
      daily: todayBookings.reduce((sum, booking) => sum + booking.service.price, 0),
      weekly: weeklyBookings.reduce((sum, booking) => sum + booking.service.price, 0),
      monthly: monthlyBookings.reduce((sum, booking) => sum + booking.service.price, 0)
    };
  };

  const getServiceStats = () => {
    const weeklyBookings = getWeeklyStats(bookings);
    const monthlyBookings = getMonthlyStats(bookings);

    const weeklyStats = calculateServiceStats(weeklyBookings);
    const monthlyStats = calculateServiceStats(monthlyBookings);

    return {
      mostBooked: {
        weekly: weeklyStats.mostBooked,
        monthly: monthlyStats.mostBooked
      },
      mostRevenue: {
        weekly: weeklyStats.mostRevenue,
        monthly: monthlyStats.mostRevenue
      }
    };
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      const updatedBookings = bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };

  React.useEffect(() => {
    refreshBookings();
  }, []);

  return (
    <BookingContext.Provider value={{
      bookings,
      addBooking,
      refreshBookings,
      getRevenueStats,
      getServiceStats,
      updateBooking,
      deleteBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
} 