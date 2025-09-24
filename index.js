const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'DeathAIAUS',
    version: '1.0.0',
    message: '💀 DeathAIAUS Platform is online! 💀',
    botStore: 'Ready',
    botTypes: '100+ Available'
  });
});

// Main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>DeathAIAUS Platform</title>
        <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; text-align: center; }
            .logo { font-size: 3em; color: #ff4444; margin-bottom: 20px; }
            .status { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .bot-store { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .bot-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 20px; }
            .bot-type { background: #333; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">💀 DeathAIAUS 💀</div>
            <div class="status">
                <h2>🚀 Platform Status: ONLINE</h2>
                <p>Advanced AI-Powered Camera Chat Platform</p>
                <p>Domain: www.deathaiaus.com.au</p>
            </div>
            <div class="bot-store">
                <h2>🤖 Bot Store - 100+ Bot Types Available</h2>
                <div class="bot-types">
                    <div class="bot-type">🧠 AI & Intelligence Bots</div>
                    <div class="bot-type">💰 Trading & Financial Bots</div>
                    <div class="bot-type">🌐 Web Scraping Bots</div>
                    <div class="bot-type">🎮 Gaming & Entertainment Bots</div>
                    <div class="bot-type">🛡️ Security & Monitoring Bots</div>
                    <div class="bot-type">🏢 Business & Productivity Bots</div>
                    <div class="bot-type">🎓 Educational & Research Bots</div>
                    <div class="bot-type">🏥 Healthcare & Medical Bots</div>
                    <div class="bot-type">🏠 Smart Home & Lifestyle Bots</div>
                    <div class="bot-type">🔧 Development & DevOps Bots</div>
                    <div class="bot-type">🎨 Creative & Media Bots</div>
                    <div class="bot-type">💼 Industry-Specific Bots</div>
                </div>
                <p><strong>Revenue Potential:</strong> $15,500/month conservative estimate</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Bot store API endpoints
app.get('/api/bots', (req, res) => {
  res.json({
    message: 'Bot store API ready',
    totalBots: 100,
    categories: [
      'AI & Intelligence',
      'Trading & Financial', 
      'Web Scraping',
      'Gaming & Entertainment',
      'Security & Monitoring',
      'Business & Productivity',
      'Educational & Research',
      'Healthcare & Medical',
      'Smart Home & Lifestyle',
      'Development & DevOps',
      'Creative & Media',
      'Industry-Specific'
    ]
  });
});

app.listen(PORT, () => {
  console.log('💀 [DEATH] DeathAIAUS Platform is now online...');
  console.log(`💀 [DEATH] Server running on port ${PORT}`);
  console.log(`💀 [DEATH] Registration number D13`);
  console.log(`💀 [DEATH] Death's personal assistant.....`);
  console.log(`💀 [DEATH] Platform: www.deathaiaus.com.au`);
  console.log(`💀 [DEATH] Bot Store: 100+ bot types available`);
  console.log(`💀 [DEATH] Ready for deployment!`);
});
