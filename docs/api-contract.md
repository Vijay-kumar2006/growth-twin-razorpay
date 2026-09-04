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
