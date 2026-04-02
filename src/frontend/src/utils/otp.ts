export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// No-op: OTP is now shown inline in the UI instead of via alert
export function showOTPAlert(_otp: string): void {
  // OTP display is handled inline in the component
}
