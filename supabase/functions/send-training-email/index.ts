import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// You will set this in the Supabase Dashboard secrets
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@example.com' // Set this to the admin's actual email

serve(async (req) => {
  try {
    // Parse the webhook payload from Supabase
    const payload = await req.json()
    
    // Ensure this is an INSERT trigger on our training requests table
    if (payload.type === 'INSERT' && payload.table === 'rater_training_requests') {
      const record = payload.record

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'THINCS Portal <onboarding@resend.dev>', // You can change this to your verified domain later
          to: [ADMIN_EMAIL],
          subject: `New THINCS Rater Training Request: ${record.full_name}`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">New THINCS Rater Training Request</h2>
              <p>A new registration of interest has been submitted via the THINCS Portal.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.full_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Rank / Role:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.rank}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Department:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.department}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Fire Service:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.fire_service}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${record.email}">${record.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>IC Level:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Level ${record.ic_level}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Authorised:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.is_authorized ? 'Yes' : 'No'}</td>
                </tr>
              </table>
              <br/>
              <p style="color: #666; font-size: 12px;">This is an automated message from the THINCS Portal.</p>
            </div>
          `
        })
      })

      const data = await res.json()
      
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ message: "Ignored: Not an INSERT event or wrong table." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
