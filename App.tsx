import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CalendarScreen from './screens/CalendarScreen';
import UpcomingScreen from './screens/UpcomingScreen';
import StatsScreen from './screens/StatsScreen';
import { BookingProvider } from './contexts/BookingContext';
import WeeklyCalendarScreen from './screens/WeeklyCalendarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <BookingProvider>
                <NavigationContainer>
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ focused, color, size }) => {
                                let iconName: keyof typeof Ionicons.glyphMap = 'calendar';
                                
                                switch (route.name) {
                                    case 'Calendar':
                                        iconName = focused ? 'calendar' : 'calendar-outline';
                                        break;
                                    case 'Weekly':
                                        iconName = focused ? 'calendar-sharp' : 'calendar-clear-outline';
                                        break;
                                    case 'Upcoming':
                                        iconName = focused ? 'time' : 'time-outline';
                                        break;
                                    case 'Stats':
                                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                                        break;
                                }
                                return <Ionicons name={iconName} size={size} color={color} />;
                            },
                            tabBarActiveTintColor: '#FF69B4',
                            tabBarInactiveTintColor: '#FFB6C1',
                            tabBarStyle: {
                                backgroundColor: 'white',
                                borderTopWidth: 0,
                                elevation: 10,
                                shadowColor: '#FF69B4',
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                height: 60,
                                paddingBottom: 8,
                                paddingTop: 8,
                            },
                            headerStyle: {
                                backgroundColor: '#FF69B4',
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        })}
                    >
                        <Tab.Screen name="Calendar" component={CalendarScreen} />
                        <Tab.Screen name="Weekly" component={WeeklyCalendarScreen} />
                        <Tab.Screen name="Upcoming" component={UpcomingScreen} />
                        <Tab.Screen name="Stats" component={StatsScreen} />
                    </Tab.Navigator>
                </NavigationContainer>
            </BookingProvider>
        </SafeAreaProvider>
    );
}
