

Steadfast Courier Limited


API Documentation


V1










Table of Contents


API Authentication Parameter
Placing an order
Bulk Order Create
Checking Delivery Status
Checking Current Balance







































API Authentication Parameter

Name

Type

Description

Value

Api-Key

String

API Key provided by Steadfast Courier Ltd.

***************

Secret-Key

String

Secret Key provided by Steadfast Courier Ltd.

***************

Content-Type

String

Request Content Type

application/json


Authentication parameters are required to be added at the header part of each request.


Base Url: https://portal.packzy.com/api/v1



Placing an order

        Path: /create_order

        Method: Post


       Input Parameters:


Name

Type

MOC

Description

Example

invoice

string

required

Must be Unique and can be alpha-numeric including hyphens and underscores.

12366

abc123

12abchd

Aa12-das4

a_sdfd-wq

recipient_name

string

required

Within 100 characters.

John Smith

recipient_phone

string

required

Must be 11 Digits Phone number

01234567890

alternative_phone

string

optional

Must be 11 Digits Phone number


recipient_email

string

optional



recipient_address

string

required

Recipient’s address within 250 characters.

Fla# A1,
House# 17/1, Road# 3/A, Dhanmondi,

Dhaka-1209

cod_amount

numeric

required

Cash on delivery amount in BDT including all charges. Can’t be less than 0.

1060

note

string

optional

Delivery instructions or other notes.

Deliver within

3 PM

item_description

string

optional

Items name and other information


total_lot

numeric

optional

Total Lot of items


delivery_type

numeric

optional

0 = for home delivery, 1 = for Point Delivery/Steadfast Hub Pick Up

0/1


        Yellow colour marked parameters are added newly.


Response:


{

    "status": 200,

    "message": "Consignment has been created successfully.",

    "consignment": {

        "consignment_id": 1424107,

        "invoice": "Aa12-das4",

        "tracking_code": "15BAEB8A",

        "recipient_name": "John Smith",

        "recipient_phone": "01234567890",

        "recipient_address": "Fla# A1,House# 17/1, Road# 3/A, Dhanmondi,Dhaka-1209",

        "cod_amount": 1060,

        "status": "in_review",

        "note": "Deliver within 3PM",

        "created_at": "2021-03-21T07:05:31.000000Z",

        "updated_at": "2021-03-21T07:05:31.000000Z"

    }

}




Bulk Order Create

        Path: /create_order/bulk-order

        Method: Post


Input Parameters:




Name

Type

MOC

Description

Example

data

Json

require

Maximum 500 items are allowed. Json encoded array

Given below




        Array Keys:


$item = [

        ‘Invoice’ => ‘adbd123’

]


Example:

public function bulkCreate(){

$orders = Order::with('address')->where('status',1)->take(500)->get();


$data = array();


foreach($orders as $order){

$item = [

'invoice' => $order->id,

'recipient_name' => $order->address ? $order->address->name : 'N/A',

'recipient_address' => $order->address ? $order->address->address : 'N/A',

'recipient_phone' => $order->address ? $order->address->phone : '',

'cod_amount' => $order->due_amount,

'note' => $order->note,

];


}


$steadfast = new Steadfast();

$result = $steadfast->bulkCreate(json_encode($data));

return $result;

}

// Example code


public function bulkCreate($data){

                 $api_key = '1m9mwrrwsjbrg0w';

         $secret_key = 'y196ftazvk9s3';


         $response = Http::withHeaders([

         'Api-Key' => $api_key,

         'Secret-Key' => $secret_key,

         'Content-Type' => 'application/json'

         ])->post($this->base_url.'/create_order/bulk-order', [

                 'data' => $data,

                 ]);

         return json_decode($response->getBody()->getContents());

         }






Result:

[

{

"invoice": "230822-1",

"recipient_name": "John Doe",

"recipient_address": "House 44, Road 2/A, Dhanmondi, Dhaka 1209",

"recipient_phone": "0171111111",

"cod_amount": "0.00",

"note": null,

"consignment_id": 11543968,

"tracking_code": "B025A038",

"status": "success"

},

{

"invoice": "230822-1",

"recipient_name": "John Doe",

"recipient_address": "House 44, Road 2/A, Dhanmondi, Dhaka 1209",

"recipient_phone": "0171111111",

"cod_amount": "0.00",

"note": null,

"consignment_id": 11543969,

"tracking_code": "B025A1DC",

"status": "success"

},

{

"invoice": "230822-1",

"recipient_name": "John Doe",

"recipient_address": "House 44, Road 2/A, Dhanmondi, Dhaka 1209",

"recipient_phone": "0171111111",

"cod_amount": "0.00",

"note": null,

"consignment_id": 11543970,

"tracking_code": "B025A23A",

"status": "success"

},

{

"invoice": "230822-1",

"recipient_name": "John Doe",

"recipient_address": "House 44, Road 2/A, Dhanmondi, Dhaka 1209",

"recipient_phone": "0171111111",

"cod_amount": "0.00",

"note": null,

"consignment_id": 11543971,

"tracking_code": "B025A3FA",

"status": "success"

},

]


If there is any error in data your will get response like

"data": [

{

"invoice": "230822-1",

"recipient_name": "John Doe",

"recipient_address": "House 44, Road 2/A, Dhanmondi, Dhaka 1209",

"recipient_phone": "0171111111",

"cod_amount": "0.00",

"note": null,

"consignment_id": null,

"tracking_code": null,

"status": "error"

},

]


Checking Delivery Status



i) By Consignment ID


                Path: /status_by_cid/{id}

Method: GET


        ii) By Your invoice ID

                Path: /status_by_invoice/{invoice}

                Method: GET


        iii) By Tracking Code

                Path: /status_by_trackingcode/{trackingCode}

                Method: GET





        Response:



        {

    "status": 200,

    "delivery_status": "in_review"

}




Delivery Statuses:


Name

Description

pending

Consignment is not delivered or cancelled yet.

delivered_approval_pending

Consignment is delivered but waiting for admin approval.

partial_delivered_approval_pending

Consignment is delivered partially and waiting for admin approval.

cancelled_approval_pending

Consignment is cancelled and waiting for admin approval.

unknown_approval_pending

Unknown Pending status. Need contact with the support team.

delivered

Consignment is delivered and balance added.

partial_delivered

Consignment is partially delivered and balance added.

cancelled

Consignment is cancelled and balance updated.

hold

Consignment is held.

in_review

Order is placed and waiting to be reviewed.

unknown

Unknown status. Need contact with the support team.



5. Checking Current Balance


        Path: /get_balance

        Method: GET


Response:

 {

    "status": 200,

    "current_balance": 0

}

পিক এন্ড ড্রপ সার্ভিসের ন্যূনতম চার্জ ৮০ টাকা প্রযোজ্য
১% ক্যাশ অন ডেলিভারি ও রিস্ক ম্যানেজমেন্ট চার্জ প্রযোজ্য
পার্সেল সাইজের কারণে ডেলিভারি মাশুল পরিবর্তিত হতে পারে
উক্ত চার্জসমূহ ভ্যাট ও ট্যাক্স ব্যাতিত
অনাকাঙ্ক্ষিত কারণবশত ডেলিভারি সময়ের পরিবর্তন হতে পারেTo **use an order ID** from your e-commerce system for **tracking or linking to Steadfast Courier**, you need to understand how the different identifiers work in their API and how to map them to your own system.

---

### 🔍 Steadfast API Key Identifiers

| Steadfast API Field | Description                                         | Can you use your order ID? |
| ------------------- | --------------------------------------------------- | -------------------------- |
| `invoice`           | Your unique order ID (your system)                  | ✅ YES (required field)     |
| `tracking_code`     | Code generated by Steadfast after placing the order | ❌ Generated by Steadfast   |
| `consignment_id`    | Internal Steadfast ID for the order                 | ❌ Generated by Steadfast   |

---

### ✅ How to Use Your Order ID

When you create an order using the `/create_order` endpoint, you send your **order ID as the `invoice`**. Steadfast stores it and you can **use it later for tracking**.

#### 📦 Example: Create Order with Your Order ID

```json
POST https://portal.packzy.com/api/v1/create_order

Headers:
{
  "Api-Key": "YOUR_API_KEY",
  "Secret-Key": "YOUR_SECRET_KEY",
  "Content-Type": "application/json"
}

Body:
{
  "invoice": "ORDER_12345",  // 👈 Your order ID
  "recipient_name": "John Smith",
  "recipient_phone": "01700000000",
  "recipient_address": "Dhaka",
  "cod_amount": 1500,
  "note": "Deliver fast",
  "item_description": "Shoes",
  "delivery_type": 0
}
```

Steadfast will return:

```json
{
  "tracking_code": "A1B2C3D4",
  "consignment_id": 12345678,
  "invoice": "ORDER_12345"
}
```

---

### 🚚 Track Order Using Your Order ID

You can **track the order using the same invoice (order ID)** via:

#### 📩 By Invoice:

```http
GET https://portal.packzy.com/api/v1/status_by_invoice/ORDER_12345
```

Example response:

```json
{
  "status": 200,
  "delivery_status": "in_review"
}
```

So your order ID (`ORDER_12345`) becomes a **bridge** between your system and Steadfast.

---

### ✅ Best Practices

* Store the `tracking_code` and `consignment_id` returned by Steadfast in your database along with your `order_id`.
* Allow users to view tracking status using your order ID (`invoice`).
* Use `status_by_invoice/{invoice}` in your React dashboard to fetch delivery status in real-time.

---

### 🔗 Source:

* [Steadfast API Docs (via Google Docs)](https://docs.google.com/document/d/e/2PACX-1vTi0sTyR353xu1AK0nR8E_WKe5onCkUXGEf8ch8uoJy9qxGfgGnboSIkNosjQ0OOdXkJhgGuAsWxnIh/pub)

Let me know if you want help implementing this with React + Firebase in your project structure.
Below is the **Steadfast Courier Limited API Documentation** explained in simple Bangla. It will be used to send orders through Steadfast from your e-commerce or delivery platform, view order status and check balance.

---

## 🔐 1. API Authentication Parameter

**The following information must be provided in the header of each request:

* **Api-Key**: API key obtained from Steadfast
* **Secret-Key**: Secret key obtained from Steadfast
* **Content-Type**: `application/json`
* **Base URL**: `https://portal.packzy.com/api/v1`

---

## 📦 2. Place an order

**Path**: `/create_order`
**Method**: `POST`

**Required Inputs:**

| Name | Type | Requirement | Explanation | Example |
| ------------------- | ------- | ----------- | ------------------------------------------ | -------------------------- |
| `invoice` | string | Required | Unique Order ID | `Aa12-das4` |
| `recipient_name` | string | Required | Recipient Name | `John Smith` |
| `recipient_phone` | string | Required | 11-digit mobile number | `01234567890` |
| `recipient_address` | string | Required | Recipient Address | `Dhanmondi, Dhaka` |
| `cod_amount` | numeric | Required | Amount to be collected from customer | `1060` |
| `note` | string | Optional | Instructions | `Deliver by 3PM` |
| `item_description` | string | Optional | Product Description | - |
| `delivery_type` | numeric | Optional | `0 = Home Delivery`, `1 = Pickup Point` | `0` |

**Response example:**

```json
{
"status": 200,
"message": "Consignment has been created successfully.",
"consignment": {
"consignment_id": 1424107,
"tracking_code": "15BAEB8A",
"recipient_name": "John Smith",
"status": "in_review"
}
}
````

---

## 🧾 3. Bulk Order Create

**Path:** `/create_order/bulk-order`

**Method:** `POST`

**Data:** 1 JSON Array (Maximum 500 orders)

```json
{
"data": [
{
"invoice": "12345",
"recipient_name": "John Doe",
"recipient_address": "Dhanmondi, Dhaka",
"recipient_phone": "01711111111",
"cod_amount": "100",
"note": "Deliver quickly"
}
]
}
```

**Response (if successful):**

```json
[
{
"invoice": "12345",
"tracking_code": "B025A038",
"status": "success"
}
]
```

**Response (incorrect) if):**

```json
[
{
"invoice": "12345",
"tracking_code": null,
"status": "error"
}
]
```

---

## 📦 4. Checking Delivery Status

**Method:** `GET`
There are 3 ways to check the status:

1. **By Consignment ID:**
`/status_by_cid/{id}`

2. **By your Invoice ID:**
`/status_by_invoice/{invoice}`

3. **By Tracking Code:**
`/status_by_trackingcode/{trackingCode}`

**Response Example:**

```json
{
"status": 200,
"delivery_status": "in_review"
}
```

**Delivery Statuses:**

| Status | Explanation |
| ------------------- | ---------------------------------- |
| `pending` | Not yet delivered |
| `delivered` | Successfully delivered |
| `partial_delivered` | Partially delivered |
| `cancelled` | Order canceled |
| `in_review` | Order shipped, under review |
| `hold` | Suspended |

---

## 💰 5. View current balance

**Path:** `/get_balance`
**Method:** `GET`

**Response:**

```json
{
"status": 200,
"current_balance": 0
}
```

---

This documentation is primarily for developers who want to manage orders, tracking, and payments directly from their website or application using the Steadfast API.

> **Sources:**
>
> * [Steadfast Courier API Documentation (Google Docs)](https://docs.google.com/document/d/e/2PACX-1vTi0sTyR353xu1AK0nR8E_WKe5onCkUXGEf8ch8uoJy9qxGfgGnboSIkNosjQ0OOdXkJhgGuAsWxnIh/pub)

If you want, I can also create JavaScript or React code examples using this API documentation.