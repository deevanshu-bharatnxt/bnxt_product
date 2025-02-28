"use client";

import { useState, useEffect } from "react";

// Extend the Window interface to include recaptchaVerifier
declare global {
    interface Window {
        recaptchaVerifier: firebase.auth.RecaptchaVerifier | null;
    }
}
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Firebase Config (your actual config here)
const firebaseConfig = {
    apiKey: "AIzaSyAgbcN6tpJNstgRFWMT8AwavcwxPWhfmWw",
    authDomain: "bharatnxtdev.firebaseapp.com",
    databaseURL: "https://bharatnxtdev-default-rtdb.firebaseio.com",
    projectId: "bharatnxtdev",
    storageBucket: "bharatnxtdev.appspot.com",
    messagingSenderId: "122724081509",
    appId: "1:122724081509:web:181d9cb7e1e25b4825cb8c",
    measurementId: "G-SZR0X6159B"
};

// Initialize Firebase (client-side only)
if (typeof window !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default function PhoneLogin() {
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [confirmationResult, setConfirmationResult] = useState<firebase.auth.ConfirmationResult | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        console.log('reCAPTCHA solved');
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired, resetting...');
                        window.recaptchaVerifier?.clear();
                        window.recaptchaVerifier = null;
                    },
                });
            }
        }
    }, []);

    const sendOtp = async () => {
        setError(""); // Clear previous errors

        if (!phoneNumber.startsWith("+")) {
            setError("Please enter phone number with country code (e.g., +91XXXXXXXXXX)");
            return;
        }

        try {
            const appVerifier = window.recaptchaVerifier;

            if (!appVerifier) {
                setError("reCAPTCHA verification failed. Please try again.");
                return;
            }
            const result = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
            setConfirmationResult(result);
            console.log("OTP sent");
        } catch (err: any) {
            setError(err.message);
            console.error("Error sending OTP", err);
            window.recaptchaVerifier?.clear();
            window.recaptchaVerifier = null;
        }
    };

    const verifyOtp = async () => {
        if (!confirmationResult) {
            setError("Please send OTP first");
            return;
        }

        try {
            const result = await confirmationResult.confirm(otp);
            console.log("User signed in:", result.user);
            alert("Login successful!");
        } catch (err: any) {
            setError(err.message);
            console.error("Error verifying OTP", err);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto border rounded-lg shadow">
            <h1 className="text-xl font-bold mb-4">Phone Number Login</h1>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="+91XXXXXXXXXX"
                    className="w-full p-2 border rounded"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button
                    className="w-full bg-blue-500 text-white py-2 rounded"
                    onClick={sendOtp}
                >
                    Send OTP
                </button>

                {confirmationResult && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="w-full p-2 border rounded"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            className="w-full bg-green-500 text-white py-2 rounded"
                            onClick={verifyOtp}
                        >
                            Verify OTP
                        </button>
                    </>
                )}

                {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                )}
            </div>

            {/* reCAPTCHA container (invisible type) */}
            <div id="recaptcha-container"></div>
        </div>
    );
}
