# Paystack Integration Setup Guide

## Overview

This application integrates Paystack for creating dedicated virtual accounts for users who complete the onboarding process (NIN, BVN, TIN verification).

## Prerequisites

1. Paystack account (https://paystack.com)
2. Paystack API keys (Secret Key and Public Key)

## Environment Variables

Add the following to your `.env` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Your Paystack Secret Key
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx  # Your Paystack Public Key
```

### Getting Your Paystack Keys

1. Log in to your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Secret Key** and **Public Key**
4. For testing, use the test keys (start with `sk_test_` and `pk_test_`)
5. For production, use live keys (start with `sk_live_` and `pk_live_`)

## Webhook Configuration

### Setting Up Webhooks in Paystack

1. Log in to Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Click "Add Webhook URL"
4. Enter your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
5. Select the following events:
   - `dedicatedaccount.assign`
   - `dedicatedaccount.success`
   - `dedicatedaccount.update`
   - `charge.success` (optional, for payment notifications)

### Webhook Security

The webhook handler verifies the signature sent by Paystack using HMAC SHA512. The signature is automatically verified for all incoming webhook requests.

## Onboarding Flow

1. **User signs up** and verifies email
2. **Redirected to onboarding page** (`/onboarding`)
3. **User submits**:
   - National Identity Number (NIN) - 11 digits
   - Bank Verification Number (BVN) - 11 digits
   - Tax Identification Number (TIN) - 9-12 digits
4. **System creates Paystack virtual account** automatically
5. **Virtual account details** are stored and displayed to user

## API Endpoints

### Get Onboarding Status
```
GET /api/onboarding/status
Authorization: Bearer <token>
```

Response:
```json
{
  "status": "completed",
  "has_virtual_account": true,
  "virtual_account": {
    "account_number": "1234567890",
    "account_name": "John Doe",
    "bank": "Providus Bank"
  }
}
```

### Submit Onboarding
```
POST /api/onboarding/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "national_id_number": "12345678901",
  "bvn": "12345678901",
  "tin": "123456789"
}
```

### Skip Onboarding
```
POST /api/onboarding/skip
Authorization: Bearer <token>
```

## Virtual Account Details

Once onboarding is completed, users receive:
- **Account Number**: Unique virtual account number
- **Account Name**: User's name as registered
- **Bank**: Bank name (e.g., "Providus Bank", "Wema Bank")

These details are displayed in:
- Onboarding completion page
- User dashboard profile section

## Testing

### Test Mode

1. Use Paystack test keys
2. Test virtual account creation
3. Verify webhook events in Paystack dashboard

### Test Virtual Account Numbers

Paystack provides test account numbers for testing. Check Paystack documentation for current test numbers.

## Production Checklist

- [ ] Switch to live Paystack keys
- [ ] Configure production webhook URL
- [ ] Test webhook signature verification
- [ ] Set up monitoring for webhook events
- [ ] Configure error alerts
- [ ] Document virtual account limits and fees

## Troubleshooting

### Virtual Account Creation Fails

1. Check Paystack API keys are correct
2. Verify user email and name are provided
3. Check Paystack dashboard for error details
4. Review server logs for detailed error messages

### Webhook Not Receiving Events

1. Verify webhook URL is accessible
2. Check webhook signature verification
3. Review Paystack dashboard webhook logs
4. Ensure webhook events are enabled

### Onboarding Status Not Updating

1. Check webhook is receiving events
2. Verify Firestore permissions
3. Review server logs for errors
4. Check onboarding document exists

## Security Notes

- Webhook signature verification is mandatory
- Never expose secret keys in frontend code
- Use HTTPS for webhook endpoints
- Regularly rotate API keys
- Monitor webhook events for suspicious activity

## Support

For Paystack-specific issues:
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com

For application issues:
- Check server logs
- Review error messages
- Verify configuration

