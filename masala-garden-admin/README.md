# Masala Garden - Restaurant Management & Ordering System

A complete full-stack restaurant management and ordering system built with Next.js, Tailwind CSS, ShadCN UI, Zustand, and Firebase.

## Features

**Customer Website:**
- Modern, responsive landing page with SEO optimization.
- Menu browsing with category tabs and dietary type indicators.
- Real-time cart system managed via Zustand.
- Seamless checkout flow with validation for Dine-in, Takeaway, and Delivery.
- Real-time order tracking progress.

**Admin Panel:**
- Dashboard overview of sales and recent orders.
- Live Orders page to accept, prepare, and complete orders.
- Menu Management for adding, editing, and deleting items.
- Point of Sale (POS) system with manual order entry.
- Thermal Printer support (45mm and 80mm receipts).

## Environment Setup

Create a `.env.local` file in the root of the project (`masala-garden-app`) and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

*Note: If no Firebase configuration is provided, the application will automatically fall back to a mock data mode for demonstration purposes.*

## Running Locally

1. Open a terminal in the `masala-garden-app` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) for the Customer view.
5. Open [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Dashboard.

## Firebase Database Structure

If you configure Firebase, set up Firestore with the following collections:
- `menu_categories`: Document should contain `name` (string) and `order` (number).
- `menu_items`: Document should contain `name`, `description`, `price` (number), `image`, `categoryId`, `isAvailable` (boolean), `type` ('veg' or 'non-veg').
- `orders`: Managed automatically by the application.
- `offers`: Contains discount rules (not fully implemented in the UI but structured in the database).

## Deployment Steps

### Frontend & API (Vercel or Netlify)

The project is a Next.js App Router application, so it is fully optimized for Vercel or Netlify.

**Deploying to Netlify:**
1. Push your code to a GitHub repository.
2. Go to Netlify, click "Add new site" -> "Import an existing project".
3. Select your GitHub repository.
4. The build command will automatically be detected as `npm run build` and the publish directory as `.next`.
5. Under "Environment Variables", add all your `NEXT_PUBLIC_FIREBASE_*` variables.
6. Click "Deploy Site". Netlify automatically configures the Next.js cache and API routes.

### Backend/Database (Firebase)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** in test mode or with strict rules restricting writes to authenticated admins (for a production setup, Firebase Auth should be integrated to secure the `/admin` routes and write operations).
3. The application communicates with Firebase directly via the client-side SDK. For server-side rendering, you can optionally configure Firebase Admin SDK inside Next.js API routes if you prefer backend-only validation in the future.
