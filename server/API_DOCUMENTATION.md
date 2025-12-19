# Crowdfunding Platform API Documentation

## Base URL
```
http://localhost:8090
```

## Authentication
Most endpoints require authentication via Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

---

## Public Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### List Campaigns
```
GET /api/campaigns?category=medical&search=keyword&sort_by=newest&limit=20&offset=0
```
**Query Parameters:**
- `category` (optional): Filter by category (medical, emergency, education, etc.)
- `search` (optional): Search in title, description, location
- `status` (optional): Filter by status (Active, Draft, Completed)
- `owner_id` (optional): Filter by campaign owner
- `sort_by` (optional): Sort by (newest, ending_soon, most_funded, most_donors)
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "campaigns": [...],
  "count": 10
}
```

### Get Campaign
```
GET /api/campaign?id=<campaign_id>
```
Returns a single campaign by ID. Automatically increments view count.

### Create Donation
```
POST /api/donation/create
```
**Body:**
```json
{
  "campaign_id": "campaign_id",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "amount": 50.00,
  "tip": 2.50,
  "is_anonymous": false,
  "message": "Good luck!",
  "payment_method": "card",
  "transaction_id": "txn_123",
  "cover_fees": true
}
```

### Get Donations
```
GET /api/donations?campaign_id=<id>&donor_id=<id>&status=completed
```
**Query Parameters:**
- `campaign_id` (optional): Filter by campaign
- `donor_id` (optional): Filter by donor
- `status` (optional): Filter by status

---

## Protected Endpoints (Require Authentication)

### User Statistics
```
GET /api/user/stats
```
Returns user dashboard statistics including:
- Total campaigns
- Active/completed campaigns
- Total raised
- Total donors
- Average donation
- Conversion rate
- Views and shares

### User Profile
```
GET /api/user/profile
```
Get user profile.

```
PUT /api/user/profile/update
```
Update user profile.

**Body:**
```json
{
  "display_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "About me...",
  "location": "New York, NY",
  "phone": "+1234567890",
  "website": "https://example.com"
}
```

### Create Campaign
```
POST /api/campaign/create
```
**Body:**
```json
{
  "title": "Campaign Title",
  "description": "Short description",
  "story": "Full story...",
  "category": "medical",
  "goal": 50000.00,
  "currency": "USD",
  "cover_image": "https://...",
  "country": "USA",
  "postcode": "10001",
  "who_for": "Sarah",
  "duration": 30,
  "deadline": "2024-12-31T00:00:00Z",
  "organizer_name": "John Doe",
  "location": "New York, NY"
}
```

### Update Campaign
```
PUT /api/campaign/update?id=<campaign_id>
```
Update campaign (only owner can update).

### Delete Campaign
```
DELETE /api/campaign/delete?id=<campaign_id>
```
Delete campaign (only owner can delete).

### Create Withdrawal
```
POST /api/withdrawal/create
```
**Body:**
```json
{
  "campaign_id": "campaign_id",
  "amount": 1000.00,
  "method": "bank",
  "account_details": {
    "account_number": "123456789",
    "routing_number": "987654321",
    "account_holder": "John Doe"
  }
}
```

**Withdrawal Methods:**
- `bank`: Bank transfer (no fee)
- `paypal`: PayPal (2.5% fee)
- `debit_card`: Debit card (3% fee)

### Get Withdrawals
```
GET /api/withdrawals?campaign_id=<id>
```
Returns withdrawal history for authenticated user.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Data Models

### Campaign
```json
{
  "id": "campaign_id",
  "owner_id": "user_id",
  "title": "Campaign Title",
  "description": "Description",
  "story": "Full story",
  "category": "medical",
  "goal": 50000.00,
  "raised": 25000.00,
  "currency": "USD",
  "cover_image": "https://...",
  "status": "Active",
  "country": "USA",
  "postcode": "10001",
  "who_for": "Sarah",
  "duration": 30,
  "deadline": "2024-12-31T00:00:00Z",
  "donors": 150,
  "views": 5000,
  "shares": 25,
  "completed": false,
  "organizer_name": "John Doe",
  "location": "New York, NY",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

### Donation
```json
{
  "id": "donation_id",
  "campaign_id": "campaign_id",
  "donor_id": "user_id",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "amount": 50.00,
  "fee": 1.75,
  "tip": 2.50,
  "total_paid": 54.25,
  "is_anonymous": false,
  "message": "Good luck!",
  "payment_method": "card",
  "transaction_id": "txn_123",
  "status": "completed",
  "created_at": "2024-01-15T00:00:00Z"
}
```

### User Stats
```json
{
  "total_campaigns": 5,
  "active_campaigns": 3,
  "completed_campaigns": 2,
  "total_raised": 127850.00,
  "total_goal": 200000.00,
  "total_donations": 28,
  "total_donors": 342,
  "avg_donation": 374.00,
  "conversion_rate": 12.5,
  "monthly_growth": 23.4,
  "total_views": 15420,
  "social_shares": 89
}
```

---

## Notes

1. **CORS**: All endpoints support CORS for `http://localhost:3000` by default (configurable via `ALLOWED_ORIGIN` env var)

2. **Pagination**: List endpoints support pagination via `limit` and `offset` parameters

3. **Search**: Campaign search is case-insensitive and searches in title, description, and location

4. **Fees**: Donation fees are 2.9% + $0.30 if `cover_fees` is true

5. **Transactions**: Campaign updates (raised amount, donor count) use Firestore transactions for consistency

6. **Anonymous Donations**: Donations can be made without authentication, but donor info is still required

