import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useBookings } from '../contexts/BookingContext';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

export default function StatsScreen() {
    const { bookings } = useBookings();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const getDayRevenue = (date: string) => {
        return bookings
            .filter(booking => booking.date === date)
            .reduce((sum, booking) => sum + booking.service.price, 0);
    };

    const getMonthStats = (date: string) => {
        const [year, month] = date.split('-');
        const monthBookings = bookings.filter(booking => 
            booking.date.startsWith(`${year}-${month}`)
        );

        // Most booked service
        const serviceCount = monthBookings.reduce((acc: any, booking) => {
            acc[booking.service.name] = (acc[booking.service.name] || 0) + 1;
            return acc;
        }, {});

        const mostBooked = Object.entries(serviceCount).reduce((a, b) => 
            (a[1] > b[1] ? a : b), ['', 0] as [string, number]
        );

        // Highest revenue service
        const serviceRevenue = monthBookings.reduce((acc: any, booking) => {
            acc[booking.service.name] = (acc[booking.service.name] || 0) + booking.service.price;
            return acc;
        }, {});

        const highestRevenue = Object.entries(serviceRevenue).reduce((a, b) => 
            (a[1] > b[1] ? a : b), ['', 0] as [string, number]
        );

        // Total month revenue
        const monthRevenue = monthBookings.reduce((sum, booking) => 
            sum + booking.service.price, 0
        );

        return {
            mostBooked: { service: mostBooked[0], count: mostBooked[1] },
            highestRevenue: { service: highestRevenue[0], amount: highestRevenue[1] },
            totalRevenue: monthRevenue
        };
    };

    const monthStats = getMonthStats(selectedDate);

    return (
        <ScrollView style={styles.container}>
            <Calendar
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#2563eb' }
                }}
                theme={{
                    todayTextColor: '#2563eb',
                    selectedDayBackgroundColor: '#2563eb',
                }}
            />

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Дневен Промет</Text>
                    <Text style={styles.statValue}>{getDayRevenue(selectedDate)} Денари</Text>
                    <Text style={styles.statDate}>{format(new Date(selectedDate), 'MMMM d, yyyy')}</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Месечен Промет</Text>
                    <Text style={styles.statValue}>{monthStats.totalRevenue} Денари</Text>
                    <Text style={styles.statDate}>{format(new Date(selectedDate), 'MMMM yyyy')}</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Најчесто Закажено</Text>
                    <Text style={styles.statValue}>{monthStats.mostBooked.service}</Text>
                    <Text style={styles.statSubvalue}>{monthStats.mostBooked.count} bookings</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statTitle}>Највисок Промет Од</Text>
                    <Text style={styles.statValue}>{monthStats.highestRevenue.service}</Text>
                    <Text style={styles.statSubvalue}>{monthStats.highestRevenue.amount} Денари</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7',
    },
    statsContainer: {
        padding: 16,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#FF69B4',
    },
    statTitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF69B4',
        marginBottom: 4,
    },
    statSubvalue: {
        fontSize: 16,
        color: '#666',
    },
    statDate: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
}); 