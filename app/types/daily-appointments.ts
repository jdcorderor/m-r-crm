import { Appointment } from "./appointment";

// Define daily appointments array type
export type DailyAppointments = {
    [date: string]: Appointment[];
}