import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const PLANS = {
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro", name: "Pro" },
  clinic: { priceId: process.env.STRIPE_CLINIC_PRICE_ID ?? "price_clinic", name: "Clinic" },
} as const;
