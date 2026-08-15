export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/api/send-email') {
      try {
        const body = await request.json().catch(() => ({}));
        const to = body.to || body.email || body.recipient || 'bao.h0146824@gmail.com';
        const subject = body.subject || body.title || (body.otp ? `Mã xác thực OTP: ${body.otp}` : 'Notification from Booking System');
        const htmlContent = body.htmlContent || body.html || (body.otp ? `<p>OTP: <strong>${body.otp}</strong></p>` : '<p>Notification</p>');
        const user = env.GMAIL_USER || 'sunsetmyfav@gmail.com';
        const pass = env.GMAIL_APP_PASSWORD || 'jpwraniqiztggrip';

        if (!pass) {
          return new Response(JSON.stringify({ success: false, error: 'Missing GMAIL_APP_PASSWORD' }), {
            status: 500,
            headers: { ...corsHeaders, 'content-type': 'application/json' }
          });
        }

        const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Basic ${btoa(`${user}:${pass}`)}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: user, name: 'Booking System' },
            subject,
            content: [{ type: 'text/html', value: htmlContent }]
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          return new Response(JSON.stringify({ success: false, error: data.errors?.[0]?.message || 'Email send failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'content-type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, message: `Email sent via MailChannels to ${to}` }), {
          status: 200,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message || 'Invalid payload' }), {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ status: 'Booking System BE Worker Running' }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    });
  }
};
