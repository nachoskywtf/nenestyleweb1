import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Mercado Pago Access Token
const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || '';

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Get payment ID from Mercado Pago webhook
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      console.error('No payment ID in webhook payload');
      return new Response('No payment ID', { status: 400 });
    }

    // Validate payment with Mercado Pago API
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment from Mercado Pago:', paymentResponse.statusText);
      return new Response('Failed to fetch payment', { status: 500 });
    }

    const payment = await paymentResponse.json();
    console.log('Payment status:', payment.status);

    // Only process approved payments
    if (payment.status !== 'approved') {
      console.log('Payment not approved, skipping');
      return new Response('Payment not approved', { status: 200 });
    }

    // Extract order details from payment metadata
    const metadata = payment.metadata || {};
    const items = metadata.items || [];
    
    // Calculate totals
    const subtotal = payment.transaction_amount || 0;
    const shipping = metadata.shipping || 0;
    const total = subtotal + shipping;

    // Insert order into Supabase
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name: metadata.customer_name || '',
        customer_phone: metadata.customer_phone || '',
        customer_address: metadata.customer_address || '',
        customer_city: metadata.customer_city || '',
        items: items,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'confirmed',
        payment_method: 'mercadopago',
        payment_id: paymentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting order:', insertError);
      return new Response('Error inserting order', { status: 500 });
    }

    console.log('Order inserted successfully');
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
