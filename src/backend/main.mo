import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";

import OutCall "http-outcalls/outcall";


actor {
  module Hospital {
    public type Hospital = {
      id : Nat;
      name : Text;
      phone : Text;
      address : Text;
      latitude : Float;
      longitude : Float;
      rating : Float;
      facilities : [Text];
      doctorIds : [Nat];
    };
  };

  module Doctor {
    public type Doctor = {
      id : Nat;
      name : Text;
      phone : Text;
      specialty : Text;
      hospitalId : Nat;
      charge : Nat;
      available : Bool;
    };
  };

  module Patient {
    public type Patient = {
      id : Nat;
      name : Text;
      phone : Text;
    };
  };

  module Booking {
    public type Booking = {
      id : Nat;
      patientId : Nat;
      doctorId : Nat;
      hospitalId : Nat;
      slotNumber : Text;
      date : Text;
      status : Text;
      patientName : Text;
      doctorName : Text;
      hospitalName : Text;
      hospitalAddress : Text;
      paymentMethod : Text;
      paymentStatus : Text;
    };
  };

  module TextUtils {
    public func repeat(text : Text, times : Nat) : Text {
      var result = "";
      var i = 0;
      while (i < times) {
        result := result # text;
        i += 1;
      };
      result;
    };
  };

  module TimeUtil {
    public func getCurrentTime() : Time.Time {
      Time.now();
    };

    public func formatTimestamp(timestamp : Time.Time) : Text {
      let seconds = timestamp / 1_000_000_000;
      let days = Int.div(seconds, 86400);
      let hours = (Int.div(seconds, 3600)) % 24;
      let minutes = (Int.div(seconds, 60)) % 60;
      let secs = seconds % 60;
      days.toText().concat(" days, " # hours.toText() # " hours, " # minutes.toText() # " minutes, " # secs.toText() # " seconds");
    };
  };

  type Hospital = Hospital.Hospital;
  type Doctor = Doctor.Doctor;
  type Patient = Patient.Patient;
  type Booking = Booking.Booking;

  module Documents {
    public type Documents = {
      id : Nat;
      name : Text;
      url : Text;
    };
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    userType : Text; // "patient" "doctor" "hospital" or "admin"
    entityId : ?Nat; // Links to patient/doctor/hospital ID
  };

  public type AccessControlState = AccessControl.AccessControlState;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type StripeConfiguration = Stripe.StripeConfiguration;
  public type ShoppingItem = Stripe.ShoppingItem;

  var nextHospitalId = 6;
  var nextDoctorId = 13;
  var nextPatientId = 1;
  var nextAppointmentId = 1;
  var nextMedicalRecordId = 1;
  var nextPrescriptionId = 1;

  let hospitals = Map.empty<Nat, Hospital>();
  let doctors = Map.empty<Nat, Doctor>();
  let patients = Map.empty<Nat, Patient>();
  let bookings = Map.empty<Nat, Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var configuration : ?StripeConfiguration = null;

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public type StripeSessionStatus = Stripe.StripeSessionStatus;
  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public type TransformationInput = OutCall.TransformationInput;
  public type TransformationOutput = OutCall.TransformationOutput;
  public query func transform(input : TransformationInput) : async TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Payment Intent Functions
  public shared ({ caller }) func createPaymentIntent(amount : Nat, currency : Text, bookingId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment intents");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    // Verify the caller is the patient who made the booking (unless admin)
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isOwnBooking = switch (patientId) {
      case (?pId) { pId == booking.patientId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnBooking) {
      Runtime.trap("Unauthorized: Can only create payment intent for your own booking");
    };

    // Return a mock client secret for now
    "pi_mock_secret_" # bookingId.toText();
  };

  public shared ({ caller }) func confirmBookingPayment(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payments");
    };

    let booking = switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    // Verify the caller is the patient who made the booking (unless admin)
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isOwnBooking = switch (patientId) {
      case (?pId) { pId == booking.patientId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnBooking) {
      Runtime.trap("Unauthorized: Can only confirm payment for your own booking");
    };

    let updatedBooking : Booking = {
      id = booking.id;
      patientId = booking.patientId;
      doctorId = booking.doctorId;
      hospitalId = booking.hospitalId;
      slotNumber = booking.slotNumber;
      date = booking.date;
      status = booking.status;
      patientName = booking.patientName;
      doctorName = booking.doctorName;
      hospitalName = booking.hospitalName;
      hospitalAddress = booking.hospitalAddress;
      paymentMethod = booking.paymentMethod;
      paymentStatus = "paid";
    };

    bookings.add(bookingId, updatedBooking);
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get user's patient ID
  func getPatientIdForCaller(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType == "patient") {
          profile.entityId;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  // Helper function to get user's doctor ID
  func getDoctorIdForCaller(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType == "doctor") {
          profile.entityId;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  // Helper function to get user's hospital ID
  func getHospitalIdForCaller(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType == "hospital") {
          profile.entityId;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  // Hospital Management - Admin only
  public shared ({ caller }) func createHospital(name : Text, phone : Text, address : Text, latitude : Float, longitude : Float, rating : Float, facilities : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create hospitals");
    };

    let id = nextHospitalId;
    nextHospitalId += 1;

    let hospital : Hospital = {
      id;
      name;
      phone;
      address;
      latitude;
      longitude;
      rating;
      facilities;
      doctorIds = [];
    };

    hospitals.add(id, hospital);
    id;
  };

  public query ({ caller }) func getHospitalById(id : Nat) : async ?Hospital {
    // Public read access - no auth required
    hospitals.get(id);
  };

  public query ({ caller }) func getAllHospitals() : async [Hospital] {
    // Public read access - no auth required
    hospitals.values().toArray();
  };

  public query ({ caller }) func getSeedData() : async ([Hospital], [Doctor]) {
    // Public read access - no auth required
    let hospitalsArray = hospitals.values().toArray();
    let doctorsArray = doctors.values().toArray();
    (hospitalsArray, doctorsArray);
  };

  public shared ({ caller }) func updateHospitalProfile(id : Nat, name : Text, phone : Text, address : Text, latitude : Float, longitude : Float, rating : Float, facilities : [Text]) : async () {
    // Admin or the hospital itself can update
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let hospitalId = getHospitalIdForCaller(caller);
    let isOwnHospital = switch (hospitalId) {
      case (?hId) { hId == id };
      case (null) { false };
    };

    if (not isAdmin and not isOwnHospital) {
      Runtime.trap("Unauthorized: Only admins or the hospital itself can update hospital profile");
    };

    let hospital = switch (hospitals.get(id)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?hospital) { hospital };
    };

    let updatedHospital : Hospital = {
      id;
      name;
      phone;
      address;
      latitude;
      longitude;
      rating;
      facilities;
      doctorIds = hospital.doctorIds;
    };

    hospitals.add(id, updatedHospital);
  };

  public query ({ caller }) func getHospitalByPhone(phone : Text) : async ?Hospital {
    // Public read access - no auth required
    hospitals.values().find(func(h) { h.phone == phone });
  };

  public shared ({ caller }) func addDoctorToHospital(hospitalId : Nat, doctorId : Nat) : async () {
    // Admin or the hospital itself can add doctors
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userHospitalId = getHospitalIdForCaller(caller);
    let isOwnHospital = switch (userHospitalId) {
      case (?hId) { hId == hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnHospital) {
      Runtime.trap("Unauthorized: Only admins or the hospital itself can add doctors");
    };

    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?hospital) { hospital };
    };

    let updatedDoctorIds = hospital.doctorIds.concat([doctorId]);
    let updatedHospital : Hospital = {
      id = hospital.id;
      name = hospital.name;
      phone = hospital.phone;
      address = hospital.address;
      latitude = hospital.latitude;
      longitude = hospital.longitude;
      rating = hospital.rating;
      facilities = hospital.facilities;
      doctorIds = updatedDoctorIds;
    };

    hospitals.add(hospitalId, updatedHospital);
  };

  // Doctor Management
  public shared ({ caller }) func createDoctor(name : Text, phone : Text, specialty : Text, hospitalId : Nat, charge : Nat, available : Bool) : async Nat {
    // Admin or the hospital can create doctors
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userHospitalId = getHospitalIdForCaller(caller);
    let isOwnHospital = switch (userHospitalId) {
      case (?hId) { hId == hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnHospital) {
      Runtime.trap("Unauthorized: Only admins or the hospital can create doctors");
    };

    let id = nextDoctorId;
    nextDoctorId += 1;

    let doctor : Doctor = {
      id;
      name;
      phone;
      specialty;
      hospitalId;
      charge;
      available;
    };

    doctors.add(id, doctor);
    id;
  };

  public query ({ caller }) func getDoctorById(id : Nat) : async ?Doctor {
    // Public read access - no auth required
    doctors.get(id);
  };

  public query ({ caller }) func getAllDoctors() : async [Doctor] {
    // Public read access - no auth required
    doctors.values().toArray();
  };

  public query ({ caller }) func getDoctorsByHospital(hospitalId : Nat) : async [Doctor] {
    // Public read access - no auth required
    let doctorsArray = doctors.values().toArray();
    doctorsArray.filter(func(d) { d.hospitalId == hospitalId });
  };

  public query ({ caller }) func searchDoctorsByNameOrSpecialty(searchTerm : Text) : async [Doctor] {
    // Public read access - no auth required
    let doctorsArray = doctors.values().toArray();
    doctorsArray.filter(
      func(d) {
        d.name.toLower().contains(#text(searchTerm.toLower())) or d.specialty.toLower().contains(#text(searchTerm.toLower()));
      }
    );
  };

  public shared ({ caller }) func updateDoctorProfile(id : Nat, name : Text, phone : Text, specialty : Text, hospitalId : Nat, charge : Nat, available : Bool) : async () {
    // Admin, the doctor themselves, or their hospital can update
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let doctorId = getDoctorIdForCaller(caller);
    let isOwnDoctor = switch (doctorId) {
      case (?dId) { dId == id };
      case (null) { false };
    };

    let doctor = switch (doctors.get(id)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?doctor) { doctor };
    };

    let userHospitalId = getHospitalIdForCaller(caller);
    let isHospitalOfDoctor = switch (userHospitalId) {
      case (?hId) { hId == doctor.hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnDoctor and not isHospitalOfDoctor) {
      Runtime.trap("Unauthorized: Only admins, the doctor, or their hospital can update doctor profile");
    };

    let updatedDoctor : Doctor = {
      id;
      name;
      phone;
      specialty;
      hospitalId;
      charge;
      available;
    };

    doctors.add(id, updatedDoctor);
  };

  public query ({ caller }) func getDoctorByPhone(phone : Text) : async ?Doctor {
    // Public read access - no auth required
    doctors.values().find(func(d) { d.phone == phone });
  };

  // Patient Management
  public shared ({ caller }) func createPatient(name : Text, phone : Text) : async Nat {
    // Any authenticated user can create a patient profile
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create patient profiles");
    };

    let id = nextPatientId;
    nextPatientId += 1;

    let patient : Patient = {
      id;
      name;
      phone;
    };

    patients.add(id, patient);
    id;
  };

  public query ({ caller }) func getPatientById(id : Nat) : async ?Patient {
    // Admin, the patient themselves, or doctors can view
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isOwnPatient = switch (patientId) {
      case (?pId) { pId == id };
      case (null) { false };
    };
    let isDoctor = switch (getDoctorIdForCaller(caller)) {
      case (?_) { true };
      case (null) { false };
    };

    if (not isAdmin and not isOwnPatient and not isDoctor) {
      Runtime.trap("Unauthorized: Only admins, the patient, or doctors can view patient details");
    };

    patients.get(id);
  };

  public query ({ caller }) func getPatientByPhone(phone : Text) : async ?Patient {
    // Admin or doctors can search by phone
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isDoctor = switch (getDoctorIdForCaller(caller)) {
      case (?_) { true };
      case (null) { false };
    };

    if (not isAdmin and not isDoctor) {
      Runtime.trap("Unauthorized: Only admins or doctors can search patients by phone");
    };

    patients.values().find(func(p) { p.phone == phone });
  };

  public shared ({ caller }) func updatePatientName(id : Nat, name : Text) : async () {
    // Admin or the patient themselves can update
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isOwnPatient = switch (patientId) {
      case (?pId) { pId == id };
      case (null) { false };
    };

    if (not isAdmin and not isOwnPatient) {
      Runtime.trap("Unauthorized: Only admins or the patient can update patient name");
    };

    let patient = switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) { patient };
    };

    let updatedPatient : Patient = {
      id = patient.id;
      name;
      phone = patient.phone;
    };

    patients.add(id, updatedPatient);
  };

  // Booking Management
  public shared ({ caller }) func createBooking(patientId : Nat, doctorId : Nat, hospitalId : Nat, date : Text, paymentMethod : Text) : async Nat {
    // Any authenticated user can create bookings
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    // Verify the patient belongs to the caller (unless admin)
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientIdOption = getPatientIdForCaller(caller);
    let isOwnPatient = switch (patientIdOption) {
      case (?pId) { pId == patientId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnPatient) {
      Runtime.trap("Unauthorized: Can only create bookings for your own patient profile");
    };

    let id = nextAppointmentId;
    nextAppointmentId += 1;

    let slotNumber = "A-" # formatNumber(id, 3);

    let patient = switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) { patient };
    };

    let doctor = switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?doctor) { doctor };
    };

    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?hospital) { hospital };
    };

    let booking : Booking = {
      id;
      patientId;
      doctorId;
      hospitalId;
      slotNumber;
      date;
      status = "booked";
      patientName = patient.name;
      doctorName = doctor.name;
      hospitalName = hospital.name;
      hospitalAddress = hospital.address;
      paymentMethod = paymentMethod;
      paymentStatus = if (paymentMethod == "card") { "pending" } else { "cash" };
    };

    bookings.add(id, booking);
    id;
  };

  func formatNumber(n : Nat, width : Nat) : Text {
    let str = n.toText();
    let len = str.size();
    if (len >= width) {
      return str;
    };
    let zeros = TextUtils.repeat("0", width - len);
    zeros # str;
  };

  public query ({ caller }) func getBookingById(id : Nat) : async ?Booking {
    // Admin, patient, doctor, or hospital can view
    let booking = switch (bookings.get(id)) {
      case (null) { return null };
      case (?b) { b };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isPatient = switch (patientId) {
      case (?pId) { pId == booking.patientId };
      case (null) { false };
    };
    let doctorId = getDoctorIdForCaller(caller);
    let isDoctor = switch (doctorId) {
      case (?dId) { dId == booking.doctorId };
      case (null) { false };
    };
    let hospitalId = getHospitalIdForCaller(caller);
    let isHospital = switch (hospitalId) {
      case (?hId) { hId == booking.hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isPatient and not isDoctor and not isHospital) {
      Runtime.trap("Unauthorized: Can only view bookings you are involved in");
    };

    ?booking;
  };

  public query ({ caller }) func getBookingsByPatient(patientId : Nat) : async [Booking] {
    // Admin or the patient themselves can view
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userPatientId = getPatientIdForCaller(caller);
    let isOwnPatient = switch (userPatientId) {
      case (?pId) { pId == patientId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnPatient) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };

    let bookingsArray = bookings.values().toArray();
    bookingsArray.filter(func(b) { b.patientId == patientId });
  };

  public query ({ caller }) func getBookingsByDoctor(doctorId : Nat) : async [Booking] {
    // Admin, the doctor, or their hospital can view
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userDoctorId = getDoctorIdForCaller(caller);
    let isOwnDoctor = switch (userDoctorId) {
      case (?dId) { dId == doctorId };
      case (null) { false };
    };

    let doctor = switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?d) { d };
    };

    let userHospitalId = getHospitalIdForCaller(caller);
    let isHospitalOfDoctor = switch (userHospitalId) {
      case (?hId) { hId == doctor.hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnDoctor and not isHospitalOfDoctor) {
      Runtime.trap("Unauthorized: Can only view bookings for your own doctor profile or hospital");
    };

    let bookingsArray = bookings.values().toArray();
    bookingsArray.filter(func(b) { b.doctorId == doctorId });
  };

  public query ({ caller }) func getBookingsByDoctorAndDate(doctorId : Nat, date : Text) : async [Booking] {
    // Admin, the doctor, or their hospital can view
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userDoctorId = getDoctorIdForCaller(caller);
    let isOwnDoctor = switch (userDoctorId) {
      case (?dId) { dId == doctorId };
      case (null) { false };
    };

    let doctor = switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?d) { d };
    };

    let userHospitalId = getHospitalIdForCaller(caller);
    let isHospitalOfDoctor = switch (userHospitalId) {
      case (?hId) { hId == doctor.hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnDoctor and not isHospitalOfDoctor) {
      Runtime.trap("Unauthorized: Can only view bookings for your own doctor profile or hospital");
    };

    let bookingsArray = bookings.values().toArray();
    bookingsArray.filter(func(b) { b.doctorId == doctorId and b.date == date });
  };

  public shared ({ caller }) func cancelBooking(id : Nat) : async () {
    // Admin, patient, doctor, or hospital can cancel
    let booking = switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) { booking };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let patientId = getPatientIdForCaller(caller);
    let isPatient = switch (patientId) {
      case (?pId) { pId == booking.patientId };
      case (null) { false };
    };
    let doctorId = getDoctorIdForCaller(caller);
    let isDoctor = switch (doctorId) {
      case (?dId) { dId == booking.doctorId };
      case (null) { false };
    };
    let hospitalId = getHospitalIdForCaller(caller);
    let isHospital = switch (hospitalId) {
      case (?hId) { hId == booking.hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isPatient and not isDoctor and not isHospital) {
      Runtime.trap("Unauthorized: Can only cancel bookings you are involved in");
    };

    let updatedBooking : Booking = {
      id = booking.id;
      patientId = booking.patientId;
      doctorId = booking.doctorId;
      hospitalId = booking.hospitalId;
      slotNumber = booking.slotNumber;
      date = booking.date;
      status = "cancelled";
      patientName = booking.patientName;
      doctorName = booking.doctorName;
      hospitalName = booking.hospitalName;
      hospitalAddress = booking.hospitalAddress;
      paymentMethod = booking.paymentMethod;
      paymentStatus = booking.paymentStatus;
    };

    bookings.add(id, updatedBooking);
  };

  public shared ({ caller }) func completeBooking(id : Nat) : async () {
    let booking = switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let doctorId = getDoctorIdForCaller(caller);
    let isAssignedDoctor = switch (doctorId) {
      case (?dId) { dId == booking.doctorId };
      case (null) { false };
    };

    if (not isAdmin and not isAssignedDoctor) {
      Runtime.trap("Unauthorized: Only admins or the assigned doctor can complete bookings");
    };

    let updatedBooking : Booking = {
      id = booking.id;
      patientId = booking.patientId;
      doctorId = booking.doctorId;
      hospitalId = booking.hospitalId;
      slotNumber = booking.slotNumber;
      date = booking.date;
      status = "completed";
      patientName = booking.patientName;
      doctorName = booking.doctorName;
      hospitalName = booking.hospitalName;
      hospitalAddress = booking.hospitalAddress;
      paymentMethod = booking.paymentMethod;
      paymentStatus = booking.paymentStatus;
    };

    bookings.add(id, updatedBooking);
  };

  public query ({ caller }) func getBookingsByHospital(hospitalId : Nat) : async [Booking] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let hospitalIdOption = getHospitalIdForCaller(caller);
    let isOwnHospital = switch (hospitalIdOption) {
      case (?hId) { hId == hospitalId };
      case (null) { false };
    };

    if (not isAdmin and not isOwnHospital) {
      Runtime.trap("Unauthorized: Can only view bookings for your own hospital");
    };

    let bookingsArray = bookings.values().toArray();
    bookingsArray.filter(func(b) { b.hospitalId == hospitalId });
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  // Seed Data - Admin only
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    if (hospitals.size() > 0 or doctors.size() > 0) {
      return;
    };

    let hospital1 : Hospital = {
      id = 1;
      name = "Sunnyvale Medical Center";
      phone = "1234567890";
      address = "123 Main Street, Sunnyvale";
      latitude = 37.3688;
      longitude = -122.0363;
      rating = 4.5;
      facilities = ["Cardiology", "Orthopedics", "Pediatrics"];
      doctorIds = [];
    };
    hospitals.add(1, hospital1);

    let hospital2 : Hospital = {
      id = 2;
      name = "Los Angeles General Hospital";
      phone = "9876543210";
      address = "456 Oak Avenue, Los Angeles";
      latitude = 34.0522;
      longitude = -118.2437;
      rating = 4.8;
      facilities = ["Cardiology", "Dermatology", "General Medicine"];
      doctorIds = [];
    };
    hospitals.add(2, hospital2);

    let hospital3 : Hospital = {
      id = 3;
      name = "New York Health Clinic";
      phone = "5555555555";
      address = "789 Elm Street, New York";
      latitude = 40.7128;
      longitude = -74.0060;
      rating = 4.2;
      facilities = ["Cardiology", "Neurology"];
      doctorIds = [];
    };
    hospitals.add(3, hospital3);

    let hospital4 : Hospital = {
      id = 4;
      name = "Palo Alto Children's Hospital";
      phone = "2223334444";
      address = "321 Maple Road, Palo Alto";
      latitude = 37.4419;
      longitude = -122.1430;
      rating = 4.7;
      facilities = ["Pediatrics", "General Medicine"];
      doctorIds = [];
    };
    hospitals.add(4, hospital4);

    let hospital5 : Hospital = {
      id = 5;
      name = "Raleigh Family Clinic";
      phone = "7778889999";
      address = "654 Pine Lane, Raleigh";
      latitude = 35.7796;
      longitude = -78.6382;
      rating = 4.3;
      facilities = ["General Medicine", "Cardiology"];
      doctorIds = [];
    };
    hospitals.add(5, hospital5);

    let doctor1 : Doctor = {
      id = 1;
      name = "Dr. John Smith";
      phone = "1111111111";
      specialty = "Cardiology";
      hospitalId = 1;
      charge = 1000;
      available = true;
    };
    doctors.add(1, doctor1);

    let doctor2 : Doctor = {
      id = 2;
      name = "Dr. Emily Johnson";
      phone = "2222222222";
      specialty = "Orthopedics";
      hospitalId = 1;
      charge = 800;
      available = true;
    };
    doctors.add(2, doctor2);

    let doctor3 : Doctor = {
      id = 3;
      name = "Dr. Michael Lee";
      phone = "3333333333";
      specialty = "Pediatrics";
      hospitalId = 4;
      charge = 1200;
      available = false;
    };
    doctors.add(3, doctor3);

    let doctor4 : Doctor = {
      id = 4;
      name = "Dr. Sarah Patel";
      phone = "4444444444";
      specialty = "Dermatology";
      hospitalId = 2;
      charge = 1500;
      available = true;
    };
    doctors.add(4, doctor4);

    let doctor5 : Doctor = {
      id = 5;
      name = "Dr. David Kim";
      phone = "5555555555";
      specialty = "General Medicine";
      hospitalId = 2;
      charge = 900;
      available = true;
    };
    doctors.add(5, doctor5);

    let doctor6 : Doctor = {
      id = 6;
      name = "Dr. Jessica Wang";
      phone = "6666666666";
      specialty = "Neurology";
      hospitalId = 3;
      charge = 1100;
      available = true;
    };
    doctors.add(6, doctor6);

    let doctor7 : Doctor = {
      id = 7;
      name = "Dr. Allen Brown";
      phone = "7777777777";
      specialty = "Cardiology";
      hospitalId = 3;
      charge = 1000;
      available = true;
    };
    doctors.add(7, doctor7);

    let doctor8 : Doctor = {
      id = 8;
      name = "Dr. Linda Green";
      phone = "8888888888";
      specialty = "General Medicine";
      hospitalId = 5;
      charge = 700;
      available = false;
    };
    doctors.add(8, doctor8);

    let doctor9 : Doctor = {
      id = 9;
      name = "Dr. Daniel Anderson";
      phone = "9999999999";
      specialty = "Pediatrics";
      hospitalId = 4;
      charge = 950;
      available = true;
    };
    doctors.add(9, doctor9);

    let doctor10 : Doctor = {
      id = 10;
      name = "Dr. Jennifer Lee";
      phone = "1010101010";
      specialty = "Dermatology";
      hospitalId = 2;
      charge = 1300;
      available = true;
    };
    doctors.add(10, doctor10);

    let doctor11 : Doctor = {
      id = 11;
      name = "Dr. Robert Martinez";
      phone = "5551234567";
      specialty = "General Medicine";
      hospitalId = 5;
      charge = 750;
      available = true;
    };
    doctors.add(11, doctor11);

    let doctor12 : Doctor = {
      id = 12;
      name = "Dr. Maria Garcia";
      phone = "5557654321";
      specialty = "Dermatology";
      hospitalId = 2;
      charge = 1400;
      available = false;
    };
    doctors.add(12, doctor12);
  };
};
