import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useBookings } from '../contexts/BookingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SERVICES } from '../contexts/BookingContext';

export default function UpcomingScreen() {
    const { bookings, refreshBookings, updateBooking, deleteBooking } = useBookings();
    const [refreshing, setRefreshing] = React.useState(false);
    const [editingBooking, setEditingBooking] = useState<null | any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStartTime, setEditStartTime] = useState(new Date());
    const [editEndTime, setEditEndTime] = useState(new Date());
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [selectedService, setSelectedService] = useState(SERVICES[0]);

    // Group bookings by date
    const groupedBookings = bookings.reduce((groups: any, booking) => {
        if (!groups[booking.date]) {
            groups[booking.date] = [];
        }
        groups[booking.date].push(booking);
        // Sort bookings within each date group by start time
        groups[booking.date].sort((a: Booking, b: Booking) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            // Compare hours first
            if (timeA[0] !== timeB[0]) {
                return timeA[0] - timeB[0];
            }
            // If hours are equal, compare minutes
            return timeA[1] - timeB[1];
        });
        return groups;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedBookings).sort((a, b) => 
        parseISO(a).getTime() - parseISO(b).getTime()
    );

    const handleEdit = (booking: any) => {
        setEditingBooking(booking);
        setEditStartTime(parseISO(`${booking.date}T${booking.startTime}`));
        setEditEndTime(parseISO(`${booking.date}T${booking.endTime}`));
        setSelectedService(SERVICES.find(s => s.id === booking.service.id) || SERVICES[0]);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (editingBooking) {
            const updatedBooking = {
                ...editingBooking,
                startTime: format(editStartTime, 'HH:mm'),
                endTime: format(editEndTime, 'HH:mm'),
                service: selectedService
            };
            await updateBooking(updatedBooking);
            setShowEditModal(false);
            refreshBookings();
        }
    };

    const handleDelete = (bookingId: string) => {
        Alert.alert(
            "Delete Appointment",
            "Are you sure you want to delete this appointment?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteBooking(bookingId);
                            refreshBookings();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete appointment");
                        }
                    }
                }
            ]
        );
    };

    const renderBookingItem = ({ item: booking }: { item: any }) => (
        <View style={styles.bookingCard}>
            <Text style={styles.customerName}>{booking.customerName}</Text>
            <Text style={styles.time}>
                {booking.startTime} - {booking.endTime}
            </Text>
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{booking.service.name}</Text>
                <Text style={styles.priceText}>{booking.service.price} Денари</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEdit(booking)}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(booking.id)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedDates}
                keyExtractor={(date) => date}
                renderItem={({ item: date }) => (
                    <View style={styles.dateGroup}>
                        <Text style={styles.dateHeader}>
                            {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                        </Text>
                        <FlatList
                            data={groupedBookings[date]}
                            keyExtractor={(item) => item.id}
                            renderItem={renderBookingItem}
                            scrollEnabled={false}
                        />
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refreshBookings} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No upcoming bookings</Text>
                }
            />

            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
            >
                {/* Edit Modal Content */}
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Appointment</Text>
                        
                        <View style={styles.timeSelectionContainer}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Text>Start: {format(editStartTime, 'HH:mm')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Text>End: {format(editEndTime, 'HH:mm')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.serviceSelection}>
                            {SERVICES.map(service => (
                                <TouchableOpacity
                                    key={service.id}
                                    style={[
                                        styles.serviceButton,
                                        selectedService.id === service.id && styles.selectedService
                                    ]}
                                    onPress={() => setSelectedService(service)}
                                >
                                    <Text style={styles.serviceButtonText}>
                                        {service.name} (${service.price})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showStartTimePicker && (
                <DateTimePicker
                    value={editStartTime}
                    mode="time"
                    onChange={(event, selectedTime) => {
                        setShowStartTimePicker(false);
                        if (selectedTime) {
                            setEditStartTime(selectedTime);
                        }
                    }}
                />
            )}

            {showEndTimePicker && (
                <DateTimePicker
                    value={editEndTime}
                    mode="time"
                    onChange={(event, selectedTime) => {
                        setShowEndTimePicker(false);
                        if (selectedTime) {
                            setEditEndTime(selectedTime);
                        }
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F7',
        padding: 16,
    },
    bookingCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#FF69B4',
    },
    customerName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#FF69B4',
    },
    dateTime: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    time: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    serviceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    serviceName: {
        fontSize: 16,
        color: '#444',
        fontWeight: '500',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF69B4',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
        fontSize: 18,
    },
    dateGroup: {
        marginBottom: 20,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    editButton: {
        backgroundColor: '#1a73e8',
        padding: 8,
        borderRadius: 5,
        marginTop: 10,
    },
    editButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 20,
        padding: 20,
    },
    timeSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        width: '45%',
    },
    saveButton: {
        backgroundColor: '#1a73e8',
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    modalButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    serviceSelection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    serviceButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    selectedService: {
        backgroundColor: '#1a73e8',
    },
    serviceButtonText: {
        color: '#444',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 5,
        width: '48%',
    },
    deleteButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '500',
    },
    priceText: {
        color: '#666',
        fontSize: 16,
    },
}); 