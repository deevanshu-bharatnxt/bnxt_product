public GetUserNameWithCardResponseV2 fetchSetuBillDetailsRawResponseV2(String refId,
            BnxtGetBillDetailsRequest bnxtGetBillDetailsRequest, String hashedUserId,
            GetUserNameWithCardRequestV2 getUserNameWithCardRequest)
            throws Exception {


        SetuFetchBillDetailsResponse setuFetchBillDetailsResponse = null;


        Long userId = null;


        if (hashedUserId.length() < 10) {
            userId = Long.parseLong(hashedUserId);
        } else {
            userId = userDetailsRepository.getUserIdByHashedUserId(hashedUserId);
        }


        GetUserNameWithCardResponseV2 getUserNameWithCardResponseV2 = new GetUserNameWithCardResponseV2();


        int attempts = 1;
        do {
            HttpHeaders headers = createHttpHeadersForSetu();
            String requestBody = String.format("{\"refId\":\"%s\"}", refId);


            HttpEntity<?> entity = new HttpEntity<>(requestBody, headers);
            String setuFetchBillDetails = setuBbpsBaseUrl + "bills/fetch/response";
            logger.info("==> fetchSetuBillDetails request --------------------> {}", requestBody);
            ResponseEntity<String> response = CommonUtil.exchange(setuFetchBillDetails, HttpMethod.POST, entity,
                    String.class);
            logger.info("==> fetchSetuBillDetails response -------------------> {}", response);


            ApiCallHistory apiCallHistory = new ApiCallHistory(69, new Gson().toJson(requestBody),
                    new Gson().toJson(response),
                    setuFetchBillDetails, userId, "CCBP");
            apiCallHistoryRepository.save(apiCallHistory);


            HttpStatus statusCode = response.getStatusCode();
            if (statusCode == HttpStatus.OK || statusCode == HttpStatus.CREATED || statusCode == HttpStatus.ACCEPTED) {
                setuFetchBillDetailsResponse = new Gson().fromJson(response.getBody(),
                        SetuFetchBillDetailsResponse.class);
                // logger.info("==> setuFetchBillDetailsResponse setuFetchBillDetailsResponse =
                // {}", response);
            }


            SetuFetchBillDetailsResponseData setuFetchBillDetailsResponseData = setuFetchBillDetailsResponse.getData();
            if ("Success".equals(setuFetchBillDetailsResponseData.getStatus())) {


                getUserNameWithCardResponseV2.setStatus(setuFetchBillDetailsResponseData.getStatus());


                Double billAmount = setuFetchBillDetailsResponseData.getBill().getAmount().doubleValue();


                if (setuFetchBillDetailsResponseData.getBill() != null) {


                    Double upiMinLimit = null;
                    Double internetBankingMinLimit = null;
                    Double totalOutstanding = null;


                    if (setuFetchBillDetailsResponseData.getPaymentLimits() != null) {
                        for (PaymentLimit paymentLimits : setuFetchBillDetailsResponseData.getPaymentLimits()) {
                            if (paymentLimits.getPaymentMode().equals("UPI")) {
                                upiMinLimit = paymentLimits.getMinLimit() / 100.0;
                            }


                            if (paymentLimits.getPaymentMode().equals("Internet Banking")) {
                                internetBankingMinLimit = paymentLimits.getMinLimit() / 100.0;
                            }
                        }
                    }


                    if (setuFetchBillDetailsResponseData.getAdditionalInfo() != null) {
                        for (AdditionalInfo additionalInfo : setuFetchBillDetailsResponseData.getAdditionalInfo()) {
                            if (additionalInfo.getName().equals("Total Due Amount")) {
                                // parsing string to int and then convert - to rupees from paise.
                                totalOutstanding = Double.parseDouble(additionalInfo.getValue());
                            }


                            if (additionalInfo.getName().equals("Maximum Permissible Amount")) {
                               
                            }
                        }
                    }


                    PaymentRange paymentRange = new PaymentRange();


                    if ("Exact and below".equals(setuFetchBillDetailsResponseData.getExactness())) {


                        // UPI min max limit
                        double finalUpiMinLimit = Math.max(10, upiMinLimit);
                        double finalUpiMaxLimit = Math.min(200000, Math.max(billAmount, totalOutstanding));


                        MinMaxRange upi = new MinMaxRange();
                        upi.setMinLimit(finalUpiMinLimit);
                        upi.setMaxLimit(finalUpiMaxLimit);
                        paymentRange.setUPI(upi);


                        // Internet banking Min Max limit.
                        if (Math.max(billAmount, totalOutstanding) ≤ 200000) { // akhil change
                            getUserNameWithCardResponseV2.getPaymentRange().setInternetBanking(null);
                        } else {
                            double finalInternetBankingMinLimit = Math.max(200000, internetBankingMinLimit);
                            double finalInternetBankingMaxLimit = Math.min(1000000, billAmount);


                            MinMaxRange internetBanking = new MinMaxRange();


                            internetBanking.setMaxLimit(finalInternetBankingMaxLimit);
                            internetBanking.setMinLimit(finalInternetBankingMinLimit);


                            paymentRange.setInternetBanking(internetBanking);
                        }


                        Double finalMinPayableAmount = Math.max(10, upiMinLimit);
                        Double finalMaxPayableAmount = Math.max(billAmount, totalOutstanding);
                        paymentRange.setMaxPayableAmount(finalMaxPayableAmount);
                        paymentRange.setMinPayableAmount(finalMinPayableAmount);


                        logger.info("loooooool: [{}], [{}], [{}]", upiMinLimit, internetBankingMinLimit,
                                totalOutstanding);


                    } else {
                        paymentRange.setMaxPayableAmount(1000000.0);
                        double finalUpiMinLimit = (upiMinLimit != null) ? upiMinLimit : 10;
                        double finalInternetBankingMinLimit = (internetBankingMinLimit != null)
                                ? internetBankingMinLimit
                                : 200000;


                        // UPI MIN_MAX range.
                        finalUpiMinLimit = Math.max(10, finalUpiMinLimit);
                        double finalUpiMaxLimit = 200000;
                        paymentRange.getUPI().setMinLimit(finalUpiMinLimit);
                        paymentRange.getUPI().setMaxLimit(finalUpiMaxLimit);
                        // Internet Banking MIN_MAX range.
                        finalInternetBankingMinLimit = Math.max(200000, finalInternetBankingMinLimit);
                        double finalInternetBankingMaxLimit = Math.min(1000000, billAmount);
                        //
                        paymentRange.getInternetBanking()
                                .setMaxLimit(finalInternetBankingMaxLimit);
                        paymentRange.getInternetBanking()
                                .setMinLimit(finalInternetBankingMinLimit);


                        paymentRange.setMaxPayableAmount(finalUpiMinLimit);
                        paymentRange.setMinPayableAmount(1000000.0);


                    }


                    getUserNameWithCardResponseV2.setPaymentRange(paymentRange);
                    List<BillDetail> bnxtBillDetails = new ArrayList<>();


                    if (setuFetchBillDetailsResponseData.getBill().getAmount() > 0) {
                        bnxtBillDetails.add(
                                new BillDetail("Total Due",
                                        setuFetchBillDetailsResponseData.getBill().getAmount().doubleValue()));
                    }


                    if (setuFetchBillDetailsResponseData.getAdditionalInfo() != null) {
                        for (AdditionalInfo aditionalInfo : setuFetchBillDetailsResponseData.getAdditionalInfo()) {
                            if (aditionalInfo.getName().equals("Minimum Payable Amount") ||
                                    aditionalInfo.getName().equals("Minimum Due") ||
                                    aditionalInfo.getName().equals("MinimumDueAmount")) {
                                bnxtBillDetails
                                        .add(new BillDetail("Minimum Due",
                                                Double.parseDouble(aditionalInfo.getValue())));
                            }
                        }
                    }


                    getUserNameWithCardResponseV2.setBnxtBillDetails(bnxtBillDetails);
                    getUserNameWithCardResponseV2.setSupportsCustomPayment(true);
                    getUserNameWithCardResponseV2.setLoginMobile(getUserNameWithCardRequest.getLoginMobile());
                    getUserNameWithCardResponseV2.setRefId(setuFetchBillDetailsResponseData.getRefId());
                    getUserNameWithCardResponseV2.setTraceId(setuFetchBillDetailsResponse.getTraceId());
                }
                return getUserNameWithCardResponseV2;
            } else if ("Failure".equals(setuFetchBillDetailsResponseData.getStatus())) {


                if (setuFetchBillDetailsResponseData.getFailureReason() != null) {
                    BillerResponse updatedFailureReason = BillerResponseConstants
                            .getResponseForCode(setuFetchBillDetailsResponseData.getFailureReason().getCode());
                    if (updatedFailureReason != null) {
                        getUserNameWithCardResponseV2.setStatus(updatedFailureReason.getStatus());
                        getUserNameWithCardResponseV2.setMessage(updatedFailureReason.getMessage());
                    } else {
                        getUserNameWithCardResponseV2.setStatus(setuFetchBillDetailsResponseData.getStatus());
                        getUserNameWithCardResponseV2
                                .setMessage(setuFetchBillDetailsResponseData.getFailureReason().getMessage());
                    }


                }


                return getUserNameWithCardResponseV2;
            } else if ("Processing".equals(setuFetchBillDetailsResponseData.getStatus())) {
                int loadingTime = 0;


                switch (attempts) {
                    case 1:
                        loadingTime = 1000;
                        break;
                    case 2:
                        loadingTime = 3000;
                        break;
                    case 3:
                        loadingTime = 5000;
                        break;
                    case 4:
                        loadingTime = 10000;
                        break;
                }


                try {
                    Thread.sleep(loadingTime);
                } catch (InterruptedException e) {
                    throw new Exception(ErrorCodeEnum.TECHNICAL_ISSUE.getValue());
                }


                attempts++;


                if (attempts == 5) {
                    logger.info("Payment details fetched on attempt : {} for RefId: {} ", attempts, refId);
                    throw new Exception(ErrorCodeEnum.UNABLE_TO_FETCH_BILL.getValue());
                }
            }
        } while ("Processing".equals(setuFetchBillDetailsResponse.getData().getStatus()) && attempts < 5);


        System.out.println("TOTAL ATTEMPTS ------------------>   " + attempts);
        return getUserNameWithCardResponseV2;
    }

