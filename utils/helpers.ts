import { Booking } from '../contexts/BookingContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const getWeeklyStats = (bookings: Booking[]) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd });
    });
};

export const getMonthlyStats = (bookings: Booking[]) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
    });
};

export const calculateServiceStats = (bookings: Booking[]) => {
    const stats = bookings.reduce((acc, booking) => {
        const { service } = booking;
        if (!acc[service.name]) {
            acc[service.name] = {
                count: 0,
                revenue: 0
            };
        }
        acc[service.name].count += 1;
        acc[service.name].revenue += service.price;
        return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const mostBooked = Object.entries(stats)
        .sort((a, b) => b[1].count - a[1].count)[0] || ['None', { count: 0 }];

    const mostRevenue = Object.entries(stats)
        .sort((a, b) => b[1].revenue - a[1].revenue)[0] || ['None', { revenue: 0 }];

    return {
        mostBooked: { service: mostBooked[0], count: mostBooked[1].count },
        mostRevenue: { service: mostRevenue[0], revenue: mostRevenue[1].revenue }
    };
}; 