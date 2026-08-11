import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 3001;
const GMAIL_USER = process.env.VITE_GMAIL_USER || 'sunsetmyfav@gmail.com';
const GMAIL_APP_PASS = process.env.VITE_GMAIL_APP_PASSWORD || 'jpwraniqiztggrip';

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/send-email') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { to, subject, htmlContent } = JSON.parse(body);
        const recipient = to || 'bao.h0146824@gmail.com';
        const mailSubject = subject || 'Notification from Booking System';
        const html = htmlContent || '<p>Notification from Booking System</p>';

        const tmpFile = path.join('/tmp', `mail_${Date.now()}.txt`);
        const payload = `Subject: ${mailSubject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}`;
        
        fs.writeFileSync(tmpFile, payload, 'utf-8');

        const cmd = `curl --ssl-reqd --url 'smtps://smtp.gmail.com:465' --user '${GMAIL_USER}:${GMAIL_APP_PASS}' --mail-from '${GMAIL_USER}' --mail-rcpt '${recipient}' -T '${tmpFile}'`;

        exec(cmd, (error, stdout, stderr) => {
          // Cleanup temp file
          try { fs.unlinkSync(tmpFile); } catch {}

          if (error) {
            console.error('[Gmail SMTP Server Error]', error.message || stderr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          } else {
            console.log(`[Gmail SMTP Server Success] Email dispatched to ${recipient}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `Email sent via Gmail SMTP to ${recipient}` }));
          }
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Booking System BE Gmail SMTP Server Running', port: PORT }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Booking System BE Gmail SMTP Server running on http://localhost:${PORT}`);
});
