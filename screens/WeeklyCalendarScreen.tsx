import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useBookings } from '../contexts/BookingContext';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

const WORKING_HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9AM to 8PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyCalendarScreen() {
    const { bookings } = useBookings();
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

    const getBookingsForTimeSlot = (day: Date, hour: number) => {
        return bookings.filter(booking => {
            const bookingDate = format(parseISO(booking.date), 'yyyy-MM-dd');
            const currentDate = format(day, 'yyyy-MM-dd');
            const bookingHour = parseInt(booking.startTime.split(':')[0]);
            
            return bookingDate === currentDate && bookingHour === hour;
        });
    };

    const renderBooking = (booking: any) => (
        <TouchableOpacity 
            key={booking.id} 
            style={styles.bookingItem}
            onPress={() => Alert.alert(
                booking.customerName,
                `Service: ${booking.service.name}\nTime: ${booking.startTime}\nPrice: ${booking.service.price} Денари`
            )}
        >
            <Text style={styles.bookingText} numberOfLines={2}>
                {booking.customerName}
                {'\n'}
                {booking.service.name}
            </Text>
        </TouchableOpacity>
    );

    const navigateWeek = (forward: boolean) => {
        const days = forward ? 7 : -7;
        setWeekStart(addDays(weekStart, days));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateWeek(false)}>
                    <Text style={styles.navigationButton}>← Previous</Text>
                </TouchableOpacity>
                <Text style={styles.weekText}>
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 5), 'MMM d, yyyy')}
                </Text>
                <TouchableOpacity onPress={() => navigateWeek(true)}>
                    <Text style={styles.navigationButton}>Next →</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.calendarContainer}>
                <View style={styles.timelineContainer}>
                    <View style={styles.daysHeader}>
                        <View style={styles.timeCell} />
                        {DAYS.map(day => (
                            <View key={day} style={styles.dayCell}>
                                <Text style={styles.dayText}>{day}</Text>
                                <Text style={styles.dateText}>
                                    {format(
                                        addDays(weekStart, DAYS.indexOf(day)),
                                        'd'
                                    )}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {WORKING_HOURS.map(hour => (
                        <View key={hour} style={styles.timeRow}>
                            <View style={styles.timeCell}>
                                <Text style={styles.timeText}>{hour}:00</Text>
                            </View>
                            {DAYS.map((day, index) => {
                                const currentDay = addDays(weekStart, index);
                                const dayBookings = getBookingsForTimeSlot(currentDay, hour);
                                
                                return (
                                    <View key={`${day}-${hour}`} style={styles.appointmentCell}>
                                        {dayBookings.map(booking => renderBooking(booking))}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#FFB6C1',
    },
    navigationButton: {
        color: '#FF69B4',
        fontSize: 16,
        fontWeight: '600',
    },
    weekText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    calendarContainer: {
        flex: 1,
    },
    timelineContainer: {
        paddingBottom: 20,
    },
    daysHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#FFB6C1',
        backgroundColor: 'white',
    },
    dayCell: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#FFE4E1',
    },
    dayText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF69B4',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    timeRow: {
        flexDirection: 'row',
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE4E1',
    },
    timeCell: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    appointmentCell: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: '#FFE4E1',
        padding: 2,
        backgroundColor: 'white',
    },
    bookingItem: {
        backgroundColor: '#FF69B4',
        borderRadius: 4,
        padding: 4,
        margin: 1,
        minHeight: 40,
    },
    bookingText: {
        color: 'white',
        fontSize: 11,
    },
}); 