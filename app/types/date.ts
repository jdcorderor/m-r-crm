// Define date type
export type Reservation = {
    id: number,
    patient_firstname: string,
    patient_lastname: string,
    patient_id: number,
    patient_birthdate: string,
    patient_email: string,
    patient_phone: string,
    patient_address: string,
    patient_gender: string,
    dentist_firstname: string,
    dentist_lastname: string,
    date: string,
    end_time?: string,
    reason: string,
    status: string,
};

// Define confirmed date type
export type ConfirmedDate = {
  id: number,
  fecha: string;
  fin_tentativo: string;
  odontologo_id: string;
}