import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn('Missing VITE_STRIPE_PUBLISHABLE_KEY in .env');
}

export const stripePromise = loadStripe(publishableKey || '');
