# Growth Twin API Contract

## 1. Intent & Recommendation (`POST /api/growth-twin/quote`)

### Request
```json
{
  "buyerIntent": {
    "budget": 18000,
    "quantity": 25,
    "requestedTags": ["jain", "note", "friday_delivery"]
  }
}
```

### Response
```json
{
  "quoteId": "quote_78fa901b",
  "version": 1,
  "status": "AWAITING_APPROVAL",
  "baseProduct": {
    "id": "hamp_jain_01",
    "name": "Jain-Friendly Gourmet Snack Hamper",
    "unitPrice": 500,
    "quantity": 25,
    "total": 12500
  },
  "recommendedAddons": [
    {
      "id": "addon_note_01",
      "name": "Custom Personalized Gift Note",
      "unitPrice": 50,
      "quantity": 25,
      "total": 1250,
      "score": 90,
      "scoreBreakdown": {
        "budgetHeadroom": 40,
        "relevance": 30,
        "compatibility": 10,
        "merchantPriority": 10
      },
      "reasons": [
        "Fits within buyer budget headroom.",
        "Matches requested preferences: note.",
        "Highly compatible with selected base items."
      ]
    }
  ],
  "financials": {
    "baseAmount": 12500,
    "addonAmount": 1250,
    "discountAmount": 0,
    "finalAmount": 13750,
    "currency": "INR"
  },
  "policyEvaluation": {
    "isCompliant": true,
    "requiresApproval": true,
    "reasons": [
      "Merchant requires explicit approval before creating payment links"
    ]
  }
}
```

---

## 2. Approval & Order Generation (`POST /api/growth-twin/approve`)

### Request
```json
{
  "quoteId": "quote_78fa901b",
  "version": 1,
  "approvalToken": "appr_usr_2026",
  "idempotencyKey": "quote_78fa901b_v1"
}
```

### Response
```json
{
  "status": "APPROVED",
  "paymentState": "PAYMENT_CREATED",
  "razorpayOrder": {
    "id": "order_mock_98234a",
    "amount": 1375000,
    "currency": "INR",
    "receipt": "rcpt_quote_78fa901b",
    "status": "created",
    "mode": "mock",
    "label": "Demo/Test Simulation"
  },
  "paymentLink": "https://test.razorpay.com/pay/plink_mock_98234a"
}
```

---

## 3. Adaptive Payment Recovery Tool (`POST /api/razoragent/mcp` - `recover_failed_transaction`)

### Request
```json
{
  "jsonrpc": "2.0",
  "id": "req_rec_01",
  "method": "recover_failed_transaction",
  "params": {
    "cart_id": "quote_78fa901b",
    "failure_reason": "GATEWAY_CARD_NETWORK_TIMEOUT",
    "select_option_id": "rec_prune_lowest_addon"
  }
}
```

### Response
```json
{
  "failedQuoteId": "quote_78fa901b",
  "failureReason": "GATEWAY_CARD_NETWORK_TIMEOUT",
  "originalTotal": 19765,
  "recoveryOptions": [
    {
      "optionId": "rec_retry_exact",
      "title": "Option 1: Instant UPI Mandate Retry (Preserve 100% Cart)",
      "recoveryStrategy": "SAME_QUOTE_RETRY",
      "preservedHardConstraints": ["jain"],
      "relaxedConstraints": [],
      "finalTotal": 19765,
      "recoveredRevenue": 19765,
      "requiresApproval": false,
      "explanation": "Safely re-attempts transaction using Razorpay Instant UPI Intent rail with the original quote fingerprint, avoiding duplicate orders."
    },
    {
      "optionId": "rec_prune_lowest_addon",
      "title": "Option 2: Value Optimized Recovery (Omit Personalized Note)",
      "recoveryStrategy": "REMOVE_LOWEST_PRIORITY_ADDON",
      "preservedHardConstraints": ["jain"],
      "relaxedConstraints": ["Personalized Foil-Embossed Gift Note & Wax Seal"],
      "finalTotal": 18515,
      "recoveredRevenue": 18515,
      "requiresApproval": false,
      "explanation": "Preserves 100% of hard constraints while shedding non-essential Personalized Note to lower transaction amount."
    }
  ],
  "selectedQuote": {
    "quoteId": "quote_78fa901b_rec_v2",
    "version": 2,
    "status": "AWAITING_APPROVAL",
    "finalTotal": 18515,
    "recoveredRevenue": 18515,
    "preservedHardConstraints": ["jain"],
    "idempotencyKey": "quote_78fa901b_rec_v2",
    "mode": "mock",
    "label": "Demo/Test Simulation"
  },
  "mode": "mock",
  "label": "Demo/Test Simulation"
}
```
