/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

interface BankNameMap {
  [key: string]: string; // This allows any string as a key
  // OR, for more specific keys (recommended if possible):
  // "AU SMALL FINANCE BANK": string;
  // "AXIS BANK": string;
  // ... all your bank names
}

interface BillerResponse {
  [key: string]: {
    // Or a more specific key type if you know them all
    status: string;
    message: string;
  };
  // OR, if you know all the possible keys:
  // BFR001: { status: string; message: string; };
  // BFR002: { status: string; message: string; };
  // ... all your BFR codes
}

const bankNameMap: BankNameMap = {
  "AU SMALL FINANCE BANK": "AU Bank Credit Card",
  "AXIS BANK": "Axis Bank Credit Card",
  "BANK OF BARODA": "BoB Credit Card",
  "CANARA BANK": "Canara Credit Card",
  "DBS BANK": "DBS Bank Credit Card",
  "THE FEDERAL BANK": "Federal Bank Credit Card",
  "HDFC BANK": "HDFC Credit Card",
  "HSBC BANK": "HSBC Credit Card",
  "ICICI BANK": "ICICI Credit card",
  "IDBI BANK": "IDBI Bank Credit Card",
  "IDFC FIRST BANK": "IDFC FIRST Bank Credit Card",
  "INDIAN BANK": "Indian bank credit card",
  "INDUSIND BANK": "IndusInd Credit Card",
  "KOTAK MAHINDRA BANK": "Kotak Mahindra Bank Credit Card",
  "PUNJAB NATIONAL BANK": "Punjab National Bank Credit Card",
  "RBL BANK": "RBL Bank Credit Card",
  "SARASWAT BANK": "Saraswat Co-Operative Bank Ltd",
  "STATE BANK OF INDIA": "SBI Card",
  "SOUTH INDIAN BANK": "One Card - South Indian",
  "UNION BANK OF INDIA": "Union Bank of India Credit Card",
  "YES BANK": "Yes Bank Credit Card",
};

const failureReasonMap: BillerResponse = {
  BFR001: {
    status: "Failure",
    message: "Payment unavailable as this card is not on BBPS. We'll notify you when it's available",
  },
  BFR002: {
    status: "Mobile Incorrect",
    message: "Share registered mobile against this card",
  },
  BFR003: { status: "Failure", message: "No bill data found!" },
  BFR004: {
    status: "Bill Paid",
    message:
      "As per bank's policy, payments can only be made when there's a bill due. We'll notify you as soon as your next bill is generated",
  },
  BFR005: { status: "Failure", message: "Card is blocked/closed" },
  BFR006: { status: "Failure", message: "Your card is not active yet" },
  BFR007: {
    status: "Failure",
    message: "Due date has passed, we are unable to fetch bill details!",
  },
  BFR008: {
    status: "Failure",
    message: "We are unable to fetch bill, please retry after sometime",
  },
  BFR009: {
    status: "Failure",
    message: "There is a bank downtime, please retry after sometime",
  },
  BFR010: {
    status: "Failure",
    message: "There is a bank downtime, please retry after sometime",
  },
};

// Replace with your actual Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyBGU66tz9RqRkPUCzuQo_WPqkdlRJ5BXPc",
//   authDomain: "bnxtstaging.firebaseapp.com",
//   databaseURL:
//     "https://bnxtstaging-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "bnxtstaging",
//   storageBucket: "bnxtstaging.appspot.com",
//   messagingSenderId: "930298277788",
//   appId: "1:930298277788:web:85ebf0aa19cbaf1c6a2259",
//   measurementId: "G-3ENFNZCLPP",
// };

// const app = initializeApp(firebaseConfig);
// const firestore = getFirestore(app);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      firestoreBankName,
      lastFourDigitOfCard,
      mobileNumber,
      userId,
      loginMobile,
      billMarkedAsPaid,
    } = body;

    // const bbps_bank_name = bankNameMap[firestore_bank_name];
    const bbps_bank_name = bankNameMap[firestoreBankName as keyof BankNameMap];

    if (!bbps_bank_name) {
      return NextResponse.json(
        { error: "Bank name not found in mapping" },
        { status: 400 }
      );
    }

    const bbpsResponse = await axios.post(
      "https://staging.bharatnxt.in/bnxt_util/setu/v1/getCCBillOfUser",
      {
        bankName: bbps_bank_name,
        lastFourDigitOfCard,
        mobileNumber,
        userId,
      }
    );
    const data = bbpsResponse.data;

    if (data.data && data.data.data) {
      const billData = data.data.data;

      if (billData.additionalInfo) {
        billData.additionalInfo = billData.additionalInfo.map((item: any) => ({
          ...item,
          value: parseFloat(item.value),
        }));
      }

      if (billData.paymentLimits) {
        billData.paymentLimits = billData.paymentLimits.map((item: any) => ({
          ...item,
          maxLimit: item.maxLimit / 100,
          minLimit: item.minLimit / 100,
        }));
      }

      if (billData.bill) {
        billData.bill.amount = billData.bill.amount / 100;
      }

      // Firestore Update (commented out in this version)
      // if (billData.status === "Success") {
      //   const cardDocRef = firestore.collection(
      //     `card_details/${userId}/cards/${firestore_bank_name} - ${lastFourDigitOfCard}`
      //   );
      //   await cardDocRef.set(
      //     {
      //       BAT: billData.bill, // No need to divide by 100 here if already done above
      //       // additionalInfo: billData.additionalInfo,
      //     },
      //     { merge: true }
      //   );
      // }

      const bnxtResponse: any = {};
      if (billData.failureReason) {
        const failureDetails = failureReasonMap[billData.failureReason.code];
        bnxtResponse.status = failureDetails?.status || "Failure";
        bnxtResponse.message = failureDetails?.message || null;
        bnxtResponse.failureReason = billData.failureReason;
      } else {
        bnxtResponse.status =
          billData.status === "Success" ? "Success" : "Failure";
        bnxtResponse.message = null;
      }

      data.data.data.bnxtResponse = bnxtResponse;

      // Payment Range Calculation
      if (billData.bill) {
        if (billData.exactness == "Exact and below") {
          const paymentRange: any = {};

          const upiMinLimitItem = billData.paymentLimits?.find(
            (item: any) => item.paymentMode === "UPI"
          );
          const internetBankingMinLimitItem = billData.paymentLimits?.find(
            (item: any) => item.paymentMode === "Internet Banking"
          );
          const TotalOutstanding = billData.additionalInfo?.find(
            (item: any) => item.name === "Total Due Amount"
          );
          const TotalOustandingValue = TotalOutstanding
            ? parseFloat(TotalOutstanding.value)
            : 0;

          const upiMinLimit = upiMinLimitItem
            ? parseFloat(upiMinLimitItem.minLimit)
            : 10;
          const internetBankingMinLimit = internetBankingMinLimitItem
            ? parseFloat(internetBankingMinLimitItem.minLimit)
            : 200000;

          paymentRange.upi = {
            minLimit: Math.max(10, upiMinLimit),
            maxLimit: Math.min(
              200000,
              Math.max(billData.bill.amount, TotalOustandingValue)
            ),
          };

          if (200000 > Math.max(billData.bill.amount, TotalOustandingValue)) {
            paymentRange.internetBanking = null;
          } else {
            paymentRange.internetBanking = {
              minLimit: Math.max(200000, internetBankingMinLimit),
              maxLimit: Math.min(1000000, billData.bill.amount),
            };
          }

          paymentRange["minPayableAmount"] = Math.max(10, upiMinLimit);
          if ((billData.exactness = "Exact and below")) {
            paymentRange["maxPayableAmount"] = Math.max(
              billData.bill.amount,
              TotalOustandingValue
            );
          } else {
            paymentRange["maxPayableAmount"] = 1000000;
          }

          data.data.data.bnxtResponse.paymentRange = paymentRange;
        } else {
          const paymentRange: any = {};

          const upiMinLimitItem = billData.paymentLimits?.find(
            (item: any) => item.paymentMode === "UPI"
          );
          const internetBankingMinLimitItem = billData.paymentLimits?.find(
            (item: any) => item.paymentMode === "Internet Banking"
          );

          const upiMinLimit = upiMinLimitItem
            ? parseFloat(upiMinLimitItem.minLimit)
            : 10;
          const internetBankingMinLimit = internetBankingMinLimitItem
            ? parseFloat(internetBankingMinLimitItem.minLimit)
            : 200000;

          paymentRange.upi = {
            minLimit: Math.max(10, upiMinLimit),
            maxLimit: 200000,
          };

          paymentRange["internetBanking"] = {
            minLimit: Math.max(200000, internetBankingMinLimit),
            maxLimit: 1000000,
          };

          paymentRange["minPayableAmount"] = paymentRange.upi.minLimit;
          paymentRange["maxPayableAmount"] = 1000000;

          data.data.data.bnxtResponse.paymentRange = paymentRange;
        }
      }

      // Ref ID
      data.data.data.bnxtResponse.traceId = data.data.traceId;
      // Trace ID
      data.data.data.bnxtResponse.refId = data.data.data.refId;

      // Bill Details

      if (billData.bill) {
        const bnxtBillDetails = [];

        if (billData.bill.amount > 0) {
          bnxtBillDetails.push({
            title: "Total Due",
            amount: billData.bill.amount,
          });
          // bnxtBillDetails["Bill Amount"] = billData.bill.amount;
        }

        if (billData.additionalInfo && Array.isArray(billData.additionalInfo)) {
          billData.additionalInfo.forEach((item: any) => {
            if (
              item.value > 0 ||
              (typeof item.value === "string" &&
                item.value !== "0" &&
                item.value !== "")
            ) {
              // Check for numeric > 0 OR non-zero, non-empty strings
              if (
                item.name === "Minimum Payable Amount" ||
                item.name === "Minimum Due" ||
                item.name === "MinimumDueAmount"
              ) {
                bnxtBillDetails.push({
                  title: "Minimum Due",
                  amount: item.value,
                });
              } 
              // else {
              //   bnxtBillDetails.push({
              //     title: item.name,
              //     amount: item.value,
              //   });
              // }
              // bnxtBillDetails[item.name] = item.value;
            }
          });
        }

        data.data.data.bnxtResponse.bnxtBillDetails = bnxtBillDetails;
      }

      data.data.data.bnxtResponse.supportsCustomPayment = true;
      data.data.data.bnxtResponse.loginMobile = loginMobile;
      bnxtResponse.supportPendingStatus = {
        "upi": false,
        "internetBanking": false,
      };
      data.data = bnxtResponse;
      // data.data = {
      //   "status": "Bill Paid",
      //   "message": "As per bank's policy, payments can only be made when there's a bill due. We'll notify you as soon as your next bill is generated",
      //   "failureReason": {
      //     "code": "BFR004",
      //     "message": "Payment received for the billing period - no bill due",
      //     "type": "BBPS"
      //   },
      //   "traceId": "CUIPM5E5ON74OL79VF4G",
      //   "refId": "CUIPM54AVN45M93GIOI0M697FUL50381103",
      //   "supportsCustomPayment": true,
      //   "loginMobile": false,
      //   "supportPendingStatus": {
      //     "upi": false,
      //     "internetBanking": false
      //   }
      // };
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching bill details:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill details" },
      { status: 500 }
    );
  }
}
