# Amman distributors 

Build a Complete Dairy Distribution Management System

Build a production-quality Dairy Products Distribution Management System with a mobile-first Android-style application UI and a responsive desktop web dashboard.

The Android/mobile experience is the primary application because salesmen and staff will use it throughout the day. Desktop is an additional interface mainly for administration, monitoring, configuration, and detailed reports.

Do not build this as a generic accounting/ERP dashboard. Design the entire UX around the actual daily workflow of a milk and dairy products distribution business.



1. CORE BUSINESS WORKFLOW

The daily workflow is:

Morning → Check Old Stock → Receive New Stock → Enter Purchase Bill → Verify Stock → Allocate Stock to Salesmen → Salesmen Check Attendance → Salesmen Receive Stock → Follow Assigned Route → Visit Shops → Enter Sales → Collect Cash/Payment → Record Returns → Close Salesman → Calculate Closing Stock → Carry Balance to Next Day

The system must automatically calculate stock, sales, cash collection, pending amounts, returns, and closing balances wherever possible.

Avoid unnecessary manual calculations.



2. USER ROLES

Create role-based access.

Admin / Owner

Full access to:

Dashboard

Live salesman monitoring

Stock

Purchase

Sales

Customers/Shops

Products

Pricing

Payments

Returns

Attendance

Reports

User management

Settings

Supervisor

Access to:

Stock

Salesman allocation

Salesman monitoring

Customer/shop management

Sales

Returns

Payments

Reports

Salesman

Mobile-first access to:

Login

Attendance

Assigned stock

Route

Shops

Sales

Product selection

Customer-specific prices

Payment collection

Cash denominations

Pending amount

Returns

Current stock

Closing stock

Do not expose unnecessary admin features to salesmen.



3. PRIMARY MOBILE APP

Design the mobile interface for fast field use.

The salesman should be able to complete a sale in only a few taps.

Use:

Large touch targets

Clear typography

Minimal typing

Product search

Quick quantity controls

Large payment buttons

Simple navigation

Sticky totals

Clear stock balance

Confirmation before final submission

The interface should work well on normal Android phones.



4. ADMIN MOBILE DASHBOARD

The Admin must be able to open the Android app and immediately see:

Today’s Overview

Total incoming stock

Total available stock

Total sales

Total cash collected

Total pending

Total returns

Main closing stock

Salesman stock

Number of active salesmen

Number of shops visited

Alerts

Live Salesman Status

For each salesman show:

Name

Attendance status

Route status

Stock received

Quantity sold

Current stock

Sales amount

Cash collected

Pending amount

Returns

Last activity

The admin must be able to check this during the day without waiting for the salesman to return.



5. MORNING STOCK WORKFLOW

When new stock arrives in the morning:

First show:

Old Stock

Example:

Old Stock = 20 L

Then enter the incoming purchase bill.

Example:

New Stock = 1,000 L

Automatically calculate:

Total Available Stock = Old Stock + New Stock

Example:

20 L + 1,000 L = 1,020 L

The UI should clearly distinguish:

Old Stock

New Stock

Total Stock

Do not force the user to manually calculate totals.



6. PURCHASE / INCOMING BILL

Create a simple purchase entry screen.

Fields:

Supplier / Factory

Bill number

Bill date

Product

Pack size

Quantity

Rate

Total

Optional batch/date information

After saving the purchase:

Automatically update stock.

Show a verification screen before final confirmation.

Example:

Old Stock: 20 L

New Bill: 1,000 L

Total: 1,020 L



7. PRODUCT MANAGEMENT

The business may have approximately 150–300 dairy products.

Do not hard-code individual products.

Create a scalable product master.

Each product should support:

Product name

Category

Pack size

Unit

MRP

Default rate

Active/inactive

Stock quantity

Examples:

Milk 100 ml

Milk 200 ml

Milk 500 ml

Milk 1 L

Curd

Other dairy products

The system must support many products without changing the application structure.



8. CUSTOMER / SHOP MANAGEMENT

Create a Customer/Shop master.

Fields:

Shop name

Owner/contact name

Phone

Address

Customer type

Active/inactive

Assigned salesman

Payment history

Outstanding

Product-wise prices

Keep customer creation extremely simple.



9. IMPORTANT PRICING RULE

This is a key business requirement.

When a new customer is created and their first bill is generated, the system should save the prices used in that first bill as the customer’s default product prices.

Example:

Customer: ABC Store

First bill:

Milk 1 L → ₹9

Curd → ₹20

Product X → ₹45

After completing the first bill, these rates become the customer’s saved/default rates.

On future bills:

Milk 1 L → automatically ₹9

Curd → automatically ₹20

Product X → automatically ₹45

The salesman should not have to remember or manually enter the rates every day.

If an admin needs to change a customer’s price later, provide an admin-only edit option.

Do NOT force percentage discounts as the primary pricing model.

The business uses different fixed prices for different shops/products.



10. SALES FLOW

Salesman opens a customer/shop.

Show:

Customer Summary

Customer name

Previous outstanding

Today’s sales

Current balance

Saved product prices

Then:

Add Products

Each product row should show:

Product name

Pack size

Customer rate

Quantity

Total

Provide + / - quantity controls.

Calculate total automatically.



11. BILL PAYMENT

After creating a bill, show three very clear options:

PAID

Full amount received.

PARTIAL

Some amount received and the rest is pending.

PENDING

No amount received.

Example:

Bill = ₹1,000

Paid:

₹1,000 received

Pending:

₹0

For partial:

Bill = ₹1,000

Received = ₹500

Pending = ₹500

Automatically calculate:

Pending = Bill Amount - Amount Received

Do not make the salesman manually calculate this.



12. CASH DENOMINATION ENTRY

When payment mode is Cash, provide quick denomination buttons.

Show:

₹1 | ₹2 | ₹5 | ₹10 | ₹20 | ₹50 | ₹100 | ₹200 | ₹500 | ₹2,000

The salesman can tap denominations to record the actual cash received.

Example:

₹500 × 1

₹100 × 2

₹50 × 1

Total Cash Received = ₹750

The system automatically calculates the amount.

If necessary, show:

Bill amount

Cash received

Balance/pending

Change

Make this extremely fast for field salesmen.

Also support:

Cash

UPI

Other payment method if required



13. DO NOT INCLUDE CREDIT LIMIT IN V1

Do NOT implement:

Credit limit

Credit blocking

Credit-limit alerts

These may be added in a future version.

For V1, simply track:

Paid

Partial

Pending

Outstanding



14. SALESMAN STOCK ALLOCATION

After morning stock verification, admin/supervisor distributes stock to salesmen.

Example:

Main Stock = 1,020 L

Salesman A = 250 L

Salesman B = 250 L

Salesman C = 250 L

Salesman D = 270 L

Automatically reduce main stock and increase each salesman’s stock.

Show a clear allocation summary before confirmation.



15. SALESMAN ATTENDANCE

When the salesman arrives:

Show:

Start Day

Then record:

Name

Date

Check-in time

Attendance status

Assigned stock

Route

The salesman should be able to complete attendance quickly.



16. SALESMAN ROUTE

Each salesman has an assigned route.

Show:

Today’s Route

Shop A

Shop B

Shop C

Shop D

Shop E

For each shop show:

Shop name

Previous purchase

Today’s visit

Today’s sale

Pending amount

Payment status

Allow salesman to open each shop and record the sale.



17. LIVE SALESMAN STOCK

If salesman receives 50 units:

Starting stock = 50

If he sells:

Shop A = 10

Shop B = 15

Shop C = 5

The system automatically shows:

Sold = 30

Current stock = 20

The salesman should not manually calculate closing stock during the route.

Admin must be able to see the same live balance.



18. LIVE CASH MONITORING

Admin should be able to open a salesman at any time.

Example:

Suresh

Stock received: 50

Sold: 32

Current stock: 18

Sales value: ₹4,500

Cash collected: ₹3,500

Pending: ₹1,000

Returns: 2

This information should update as salesmen submit transactions.



19. RETURNS

When salesman returns from the route, allow return entry.

Record:

Product

Quantity

Reason

Customer

Salesman

Automatically update:

Salesman stock

and

Main/return stock as appropriate.



20. CLOSING STOCK

At the end of the day:

Calculate automatically:

Opening/Allocated Stock + Returns - Sales = Closing Stock

Do not require manual closing calculations unless there is a discrepancy.

Show:

Opening stock

Stock received

Sales

Returns

Expected closing stock

Actual closing stock

Difference

If there is a difference, clearly highlight it.



21. NEXT-DAY STOCK

Today’s closing stock must automatically become tomorrow’s opening/old stock.

Example:

Today’s closing stock = 20 L

Tomorrow morning:

Old Stock = 20 L

Then if new stock = 1,000 L:

Total available = 1,020 L

The user should not need to manually carry the balance forward.



22. CUSTOMER PURCHASE TREND ALERT

The admin needs an important business insight.

Example:

A customer normally purchases:

10 L per day.

Recently:

Day 1 → 7 L

Day 2 → 7 L

The system should identify the decrease and show an alert.

Example:

Customer Purchase Drop

ABC Store

Normal daily purchase: 10 L

Recent purchase: 7 L

Drop: 30%

Duration: 2 days

Action:

Ask Salesman to Check

This should be an informational alert, not an aggressive automatic decision.

Allow configurable thresholds later.



23. CUSTOMER HISTORY

Customer page should show:

Today’s purchase

Previous purchases

Product-wise purchase history

Quantity trend

Payment history

Outstanding

Last purchase date

Average daily quantity

Recent decrease/increase

Use simple charts where useful.



24. REPORTS

Provide mobile-friendly dashboards and detailed desktop reports.

Sales Reports

Today

Yesterday

Date range

Product-wise

Customer-wise

Salesman-wise

Stock Reports

Opening stock

New stock

Sales

Returns

Closing stock

Salesman stock

Product stock

Payment Reports

Paid

Partial

Pending

Cash collected

UPI collected

Customer outstanding

Salesman Reports

Attendance

Stock received

Sales

Returns

Current stock

Cash collected

Pending



25. DESKTOP VERSION

The desktop version is an additional management interface.

Use a wider layout with:

Sidebar navigation

Tables

Filters

Date ranges

Detailed reports

Product management

Customer management

Pricing management

Purchase management

Stock management

User management

Dashboard analytics

The desktop and Android app must use the same backend/database and real-time data.

If a salesman creates a sale on Android, the admin desktop dashboard should reflect it.



26. MOBILE NAVIGATION

For admin:

Bottom navigation:

Home | Sales | Stock | Customers | More

For salesman:

Home | Route | Sales | Stock | More

Keep navigation simple.



27. DESIGN STYLE

Create a professional modern business application.

Design goals:

Clean

Fast

Simple

Professional

Easy for non-technical staff

Mobile-first

Minimal typing

Large touch targets

Clear status indicators

Strong visual hierarchy

Use cards for key metrics.

Use clear status colors consistently:

Green = Paid / Completed / Healthy

Orange = Partial / Attention

Red = Pending / Problem

Blue = Informational

Do not make the interface visually complicated.



28. DASHBOARD CARDS

Admin mobile dashboard should have:

Today’s Sales

Cash Collected

Pending

Total Stock

New Stock

Returns

Active Salesmen

Shops Visited

Then a live salesman section.



29. IMPORTANT AUTOMATIONS

The frontend must make these workflows feel automatic:

Purchase entry updates stock.

Old + new stock calculates total.

Stock allocation reduces main stock.

Sales reduce salesman stock.

Payment updates outstanding.

Cash denominations calculate cash received.

Returns update stock.

Closing stock calculates automatically.

Closing stock carries into next day’s opening stock.

First customer bill saves product rates for that customer.

Future bills automatically use saved customer rates.

Admin sees live salesman sales and cash.

Customer purchase drops can generate informational alerts.



30. DO NOT OVERBUILD V1

Do NOT add unnecessary features.

Specifically exclude for now:

Credit limits

Complex accounting

GST/tax complexity unless explicitly required later

Invoice printing

Ice cream management

Complicated discount engines

Warehouse management complexity

Unnecessary CRM features

Focus on:

Stock + Salesman + Customer + Sales + Payment + Returns + Closing Stock + Reports



31. SAMPLE DATA

Populate the frontend with realistic demo data so every screen can be tested.

Create example:

Products

Milk 100 ml

Milk 200 ml

Milk 500 ml

Milk 1 L

Curd 500 g

Curd 1 kg

Other dairy products

Salesmen

Suresh

Salesman 2

Salesman 3

Salesman 4

Customers

ABC Store

Sri Lakshmi Stores

Murugan Stores

New Star Supermarket

Use realistic quantities and transactions.



32. DEMO SCENARIO

The application must demonstrate this complete scenario:

6:00 AM

Old stock = 20 L

New stock arrives = 1,000 L

Purchase bill entered.

System shows:

Total stock = 1,020 L

Stock is divided among 4 salesmen.

Salesmen mark attendance.

Each salesman receives allocated stock.

Salesman opens route.

Visits customer.

Creates first bill.

The bill’s product prices are automatically saved for that customer.

Next visit uses the saved prices automatically.

Salesman records payment.

If cash:

Uses denomination buttons.

Admin can immediately see:

Sales

Cash collected

Pending

Remaining stock

Salesman records returns.

End of day:

System calculates closing stock.

Closing stock becomes next day’s opening/old stock.

The admin dashboard shows the complete business position.



33. FRONTEND QUALITY REQUIREMENT

Build all screens as connected, realistic product flows rather than isolated mockup pages.

Buttons should lead to functional screens.

Forms should have validation.

Totals should calculate automatically.

Use realistic loading, empty, success, and error states.

Use confirmation dialogs for important actions such as:

Confirm purchase

Confirm stock allocation

Complete sale

Record payment

Submit return

Close salesman day

The final result should feel like a real production application, not a static UI prototype.

Start with the mobile Android experience first, then make the same system responsive and powerful on desktop.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dd3f2085-bc8e-4101-aa92-bd0b6e03806f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
