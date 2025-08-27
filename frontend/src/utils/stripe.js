import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key (safe to use in frontend)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Rig0F01MhKpEcJlvCTqxCkniGu0nyxXF7MMWmBidlepRMwuH2nNjaTGfiamB9qiN6Umkco0LZYJL2F5ajdF8EHJ00MIMYa9zk';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default stripePromise; 