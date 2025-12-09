# Sales Tracker - Admin Web Dashboard

A Next.js-based admin dashboard for monitoring field sales activities and managing product deliveries.

## Features

- **Real-Time Map Dashboard**: Monitor all active sales positions and delivery progress on an interactive Mapbox map
- **Employee Management**: Add, edit, and manage employee accounts
- **Route Management**: Create and manage daily delivery routes per salesperson
- **Route Details**: View detailed route information with customer list and map visualization
- **Delivery Tracking**: Track delivery status with proof-of-delivery photos and timestamps

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom design tokens
- **shadcn/ui** - UI component library
- **React Query (TanStack Query)** - Data fetching and state management
- **Zustand** - Authentication state management
- **Supabase** - Backend database and authentication
- **Mapbox GL** - Interactive maps
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Configure Environment Variables**:
   - Create a `.env.local` file in the root directory
   - Copy from `env.example` and fill in your values:
     ```
     # Mapbox Configuration
     NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_public_token_here
     
     # Supabase Configuration
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
     
     # For seeding (optional, only needed for seed script)
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```
   - **Mapbox**: Get a **PUBLIC** token (starts with `pk.`) from [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - **Supabase**: Get your project URL and keys from [https://app.supabase.com/project/_/settings/api](https://app.supabase.com/project/_/settings/api)

3. **Set up Supabase Database**:
   - Create a new Supabase project at [https://supabase.com](https://supabase.com)
   - Run the migration file to create the database schema:
     - Go to SQL Editor in your Supabase dashboard
     - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
     - Execute the migration
   - (Optional) Seed the database with sample data:
     ```bash
     npm run seed
     ```
     Note: This requires `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`

4. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

After seeding the database, you can login with:
- **Admin Email**: `admin@sales-tracker.com`
- **Admin Password**: `password123`

Or use any of the sales user accounts created by the seed script (format: `firstname.lastname@sales-tracker.com`, password: `password123`)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard pages
│   │   ├── employees/     # Employee management
│   │   ├── routes/        # Route management
│   │   └── deliveries/     # Delivery details
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-layout.tsx
│   ├── map-dashboard.tsx
│   └── route-map.tsx
├── lib/                   # Utilities and helpers
│   ├── api.ts            # Supabase API functions
│   ├── hooks.ts          # React Query hooks
│   ├── mock-data.ts      # Type definitions
│   ├── store.ts          # Zustand store
│   └── supabase/         # Supabase client
│       └── client.ts
├── scripts/              # Utility scripts
│   └── seed-data.ts      # Database seeding script
├── supabase/             # Database migrations
│   └── migrations/
│       └── 001_initial_schema.sql
└── project-documentation/ # Project documentation
```

## Features Overview

### Map Dashboard
- Real-time view of all active sales personnel
- Customer delivery markers (green = delivered, yellow = pending)
- Sales progress tracking
- Interactive map with popups

### Employee Management
- View all employees
- Add new employees
- Edit employee information
- Activate/deactivate employees

### Route Management
- Create routes for specific dates
- Assign customers to salespersons
- View route list with progress indicators
- Track delivery completion

### Route Details
- Detailed customer list with visit order
- Interactive map showing route path
- Delivery status for each customer
- Click to view individual delivery details

### Delivery Details
- Customer information
- Proof-of-delivery photos (from Unsplash)
- Delivery timestamp and location
- Delivery notes

## Database Schema

The application uses Supabase as the backend database. The schema includes:

- **employees** - Admin and sales user accounts
- **regions** - Indonesian regional coverage tracking
- **customers** - Customer/store information with locations
- **routes** - Daily sales routes
- **route_customers** - Junction table for routes and customers
- **deliveries** - Individual delivery records with proof photos
- **attendances** - Employee clock in/out records

All tables have Row Level Security (RLS) enabled with role-based access policies.

## Seeding Data

The seed script (`scripts/seed-data.ts`) generates comprehensive test data:
- 2 admin users
- 25+ sales users with realistic Indonesian names
- 375+ customers (15-20 per sales user) distributed across Java and Sumatra
- 7 Indonesian regions (Sumatra and Java marked as covered)
- Routes for the past 7 days and today
- Deliveries with varied completion status
- Attendance records for active sales users

To seed your database:
```bash
npm run seed
```

Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.

## Design System

The application follows the design tokens specified in the product canvas:
- **Primary Color**: #1FA033 (Apple Green)
- **Success**: #30D148
- **Warning**: #FFC107
- **Danger**: #E74C3C
- **Typography**: Inter font family
- **Spacing**: Consistent spacing tokens (xs, sm, md, lg, xl)

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Notes

- All images use Unsplash as specified
- **Mapbox Token**: You must use a **PUBLIC token** (pk.*) for client-side Mapbox GL. Secret tokens (sk.*) will cause runtime errors.
- **Supabase Auth**: Authentication uses Supabase Auth with email/password. Users are created via the seed script.
- **Row Level Security**: All tables have RLS enabled. Admins can manage all data, sales users can only manage their own routes and deliveries.
- The seed script uses the service role key to bypass RLS for data insertion.

## Future Enhancements

- Real API integration
- Real-time updates via WebSocket
- Advanced route optimization
- Export functionality (PDF/Excel)
- Performance analytics
- Inventory management
- Sales module

