import { DeviceEventEmitter } from 'react-native';

export const BOOKING_ADDED = 'BOOKING_ADDED';

export const emitBookingAdded = () => {
    console.log('Emitting BOOKING_ADDED event');
    DeviceEventEmitter.emit(BOOKING_ADDED);
    console.log('BOOKING_ADDED event emitted');
};

export const addBookingListener = (callback: () => void) => {
    console.log('Adding BOOKING_ADDED listener');
    const subscription = DeviceEventEmitter.addListener(BOOKING_ADDED, () => {
        console.log('BOOKING_ADDED event received');
        callback();
    });
    return subscription;
};