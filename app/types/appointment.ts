// Define appointment type
export type Appointment = {
    id: number,
    patient: string,
    date: string,
    end: string,
    reason: string,
    record_id: number,
    dentist_id?: number,
    dentist?: string,
}