// api/create-checkout-session.js

import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: (item.currency || "usd").toLowerCase(),
        product_data: {
          name: `${item.name} (Size ${item.size}${item.color ? `, ${item.color}` : ""})`,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.qty,
    }));

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customerEmail || undefined,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "NG", "AU", "DE", "FR", "IE", "NL", "ZA"],
      },
      success_url: `${origin}/?order=success`,
      cancel_url: `${origin}/?order=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
