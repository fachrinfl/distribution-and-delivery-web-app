# Product Canvas – MVP Distribution & Delivery Sales System

## 1. Product Summary
This product is a simple solution for monitoring field sales activities and managing product deliveries to customers. The primary focus of this MVP is:
- Recording sales attendance (clock in / clock out) with location.
- Managing daily delivery routes per salesperson.
- Recording delivery status (delivered / pending) including proof-of-delivery photos.
- Providing a real-time map dashboard showing all sales locations and delivery progress.

The product is designed as an early prototype for a cigarette distributor but can be adapted for any distribution business.

---

## 2. Product Objectives
1. **Improve Field Visibility**  
   Give owners and managers clear visibility into daily field operations.

2. **Provide Delivery Transparency**  
   Ensure every delivery is clearly recorded with photo evidence and a timestamp.

3. **Enable Structured Route Planning**  
   Allow admins to assign delivery routes per day and per salesperson.

4. **Reduce Fraud or Inaccurate Reporting**  
   With photos, timestamps, and coordinates, delivery reports become verifiable and reliable.

5. **Serve as a Foundation for Future Expansion**  
   The MVP lays the groundwork for more advanced distribution modules such as sales, inventory, billing, and performance analytics.

---

## 3. User Segments

### 3.1 Admin / Distributor Owner
- Manages employee accounts.
- Creates delivery routes.
- Monitors real-time sales positions.
- Reviews delivery proofs.

### 3.2 Field Sales (Courier / Delivery Personnel)
- Records attendance (clock in/out).
- Views daily delivery tasks.
- Submits delivery completion with photo.

---

## 4. Key Problems Addressed
1. **Lack of real-time visibility of field staff.**
2. **Delivery proofs are inconsistent or unrecorded.**
3. **Unstructured delivery routes lead to inefficiency.**
4. **Manual reporting slows down operations and is prone to errors.**

---

## 5. Product Solution (Overview)

The product contains two main components:

### 1. Field Sales Mobile App
Used by sales to:
- Clock in / clock out with location
- View daily delivery list
- Submit delivery proof with photo
- Mark deliveries as completed

### 2. Admin Web Dashboard
Used by admin to:
- Add and manage employees
- Create delivery routes per date per salesperson
- Monitor real-time map of all active sales positions
- View delivery status per customer
- View proof-of-delivery photos

---

## 6. Mobile App – Core Features (MVP)

### 6.1 Sales Login
Sales login using email and password created by the admin.

### 6.2 Clock In / Clock Out
- One-tap check-in and check-out.
- Records timestamp and GPS location.
- Shows today's status clearly.

### 6.3 Daily Delivery List
Sales see:
- Customer list assigned for today
- Visit order (1, 2, 3…)
- Status: Pending / Delivered

### 6.4 Delivery Details
Sales can view:
- Customer name & address
- Location pin
- Visit order
- Navigation button (open in maps)

### 6.5 Delivery Completion Submission
Sales submit:
1. Photo proof
2. Optional notes
3. Timestamp & GPS location
4. Status updates to **Delivered**

### 6.6 Daily Activity Summary
Sales can see:
- Clock in/out time
- Total deliveries vs completions
- Outstanding tasks

---

## 7. Admin Web Dashboard – Core Features (MVP)

### 7.1 Admin Login
Secure login for admins.

### 7.2 Real-Time Map Dashboard
Shows all active sales with:
- Name
- Duty status
- Delivery progress (X/Y delivered)
- Button to view detailed route

### 7.3 Employee Management
Admin can:
- View employee list
- Add employee (name, email, password, role)
- Edit or deactivate employee accounts

### 7.4 Route Management
#### Route List
Shows:
- Date
- Salesperson
- Total customers in route
- Delivered vs pending

#### Create Route
Admin selects:
1. Date
2. Salesperson
3. Customer list for that day
4. Visit order

Routes appear in the sales mobile app on the corresponding date.

### 7.5 Route Details
Shows:
- Customer list with status and timestamps
- Visit order
- Map with customer markers

### 7.6 Customer Delivery Details
Shows:
- Customer info
- Location
- Proof photo
- Delivery timestamp
- Notes

---

## 8. User Flow

### Admin
1. Login → Add employees → Add customers
2. Create daily routes
3. Monitor real-time map
4. Review delivery proofs

### Sales
1. Login
2. Clock in
3. Perform deliveries based on assigned route
4. Submit proofs
5. Clock out

---

## 9. Scope & Limitations (MVP)
- No inventory or sales modules yet
- No automatic PDF/Excel reports
- No incentive/commission calculations
- Route planning is manual and simple
- Focus only on:
  - Attendance
  - Delivery status
  - Photo proof
  - Real-time tracking (basic)

---

## 10. Business Value
- **Increased transparency** in field operations
- **Reduced disputes** between sales, admin, and customers
- **Operational efficiency** through centralized monitoring
- **Reliable proof of deliveries** using photos & GPS
- **Strong foundation** for future product expansions

---

## 11. Key Success Metrics
- Percentage of deliveries logged with complete proof
- Number of daily active sales users
- Reduction in delivery-related disputes
- Adoption rate among admin & sales

---

# 12. UI Style Guide & Design Tokens (Web & Mobile)
To ensure consistency across platforms, we introduce a unified style guide.

## 12.1 Core Brand Identity
- **Tone**: Professional, clean, logistic-focused
- **Feeling**: Simple, trustworthy, efficient

## 12.2 Colors (Design Tokens)
| Token | Color | Usage |
|-------|--------|--------|
| `--color-primary` | #1FA033 (Apple Green) | Primary actions, highlights |
| `--color-primary-dark` | #148026 | Active states, map markers for delivered |
| `--color-accent` | #2BC041 | Status indicators |
| `--color-success` | #30D148 | Delivered status |
| `--color-warning` | #FFC107 | Pending status |
| `--color-danger` | #E74C3C | Failed or issues |
| `--color-gray-100` | #F5F5F5 | Background light |
| `--color-gray-800` | #333333 | Text primary |
| `--color-white` | #FFFFFF | Surfaces, cards |

---

## 12.3 Typography
| Token | Font | Usage |
|--------|--------|--------|
| `--font-heading` | Inter / SF Pro Display | Titles & section headers |
| `--font-body` | Inter / SF Pro Text | Body content |
| `--font-size-xl` | 24px | Page titles |
| `--font-size-lg` | 20px | Section headings |
| `--font-size-md` | 16px | Body text |
| `--font-size-sm` | 14px | Labels, captions |

---

## 12.4 Component Style Guidelines
### Buttons
- Primary: Green background, white text
- Secondary: White background, green outline
- Corner radius: 8px
- Height: 44–48px

### Cards
- White surface
- Light shadow
- 12px radius
- Used for list items (employees, routes, deliveries)

### Map Markers
- **Sales on-duty**: Primary green
- **Sales off-duty**: Gray
- **Customer pending**: Warning yellow
- **Customer delivered**: Success green

### Input Fields
- Border radius: 8px
- Border color: gray-300
- Label font: small, medium weight

---

## 12.5 Mobile Spacing Tokens
| Token | Value |
|--------|--------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |

---

## 12.6 Iconography
- Simple, line-based icons
- Consistent stroke weight (1.5–2px)
- Common icons:
  - Location pin
  - Clock in/out
  - Checklist
  - User
  - Route/road
  - Camera

---

## 12.7 Layout Principles
- Clear separation between sections using spacing
- Avoid clutter; prioritize essential actions
- Consistent component hierarchy (title → content → actions)
- Web and mobile should feel like the same brand

---

This updated canvas now includes:
- Full English translation
- A comprehensive UI Style Guide
- Design Tokens for consistent branding across web and mobile.