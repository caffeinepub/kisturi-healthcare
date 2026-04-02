import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Patient {
    id: bigint;
    name: string;
    phone: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Hospital {
    id: bigint;
    latitude: number;
    name: string;
    longitude: number;
    address: string;
    facilities: Array<string>;
    rating: number;
    phone: string;
    doctorIds: Array<bigint>;
}
export interface Doctor {
    id: bigint;
    name: string;
    available: boolean;
    specialty: string;
    hospitalId: bigint;
    charge: bigint;
    phone: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Booking {
    id: bigint;
    status: string;
    doctorId: bigint;
    paymentStatus: string;
    paymentMethod: string;
    patientId: bigint;
    date: string;
    hospitalId: bigint;
    hospitalAddress: string;
    patientName: string;
    hospitalName: string;
    doctorName: string;
    slotNumber: string;
}
export interface UserProfile {
    userType: string;
    name: string;
    entityId?: bigint;
    phone: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDoctorToHospital(hospitalId: bigint, doctorId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(id: bigint): Promise<void>;
    completeBooking(id: bigint): Promise<void>;
    confirmBookingPayment(bookingId: bigint): Promise<void>;
    createBooking(patientId: bigint, doctorId: bigint, hospitalId: bigint, date: string, paymentMethod: string): Promise<bigint>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createDoctor(name: string, phone: string, specialty: string, hospitalId: bigint, charge: bigint, available: boolean): Promise<bigint>;
    createHospital(name: string, phone: string, address: string, latitude: number, longitude: number, rating: number, facilities: Array<string>): Promise<bigint>;
    createPatient(name: string, phone: string): Promise<bigint>;
    createPaymentIntent(amount: bigint, currency: string, bookingId: bigint): Promise<string>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllDoctors(): Promise<Array<Doctor>>;
    getAllHospitals(): Promise<Array<Hospital>>;
    getBookingById(id: bigint): Promise<Booking | null>;
    getBookingsByDoctor(doctorId: bigint): Promise<Array<Booking>>;
    getBookingsByDoctorAndDate(doctorId: bigint, date: string): Promise<Array<Booking>>;
    getBookingsByHospital(hospitalId: bigint): Promise<Array<Booking>>;
    getBookingsByPatient(patientId: bigint): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDoctorById(id: bigint): Promise<Doctor | null>;
    getDoctorByPhone(phone: string): Promise<Doctor | null>;
    getDoctorsByHospital(hospitalId: bigint): Promise<Array<Doctor>>;
    getHospitalById(id: bigint): Promise<Hospital | null>;
    getHospitalByPhone(phone: string): Promise<Hospital | null>;
    getPatientById(id: bigint): Promise<Patient | null>;
    getPatientByPhone(phone: string): Promise<Patient | null>;
    getSeedData(): Promise<[Array<Hospital>, Array<Doctor>]>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchDoctorsByNameOrSpecialty(searchTerm: string): Promise<Array<Doctor>>;
    seedData(): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateDoctorProfile(id: bigint, name: string, phone: string, specialty: string, hospitalId: bigint, charge: bigint, available: boolean): Promise<void>;
    updateHospitalProfile(id: bigint, name: string, phone: string, address: string, latitude: number, longitude: number, rating: number, facilities: Array<string>): Promise<void>;
    updatePatientName(id: bigint, name: string): Promise<void>;
}
