<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>DeshaDarsana — AI-Powered Local Experience Discovery Platform</title>
  <style>
    :root{
      --bg:#f7f9fb;
      --card:#ffffff;
      --muted:#6b7280;
      --accent:#0f172a;
      --accent-2:#0ea5a4;
      --border:#e6eef5;
      --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    html,body{height:100%;}
    body{
      margin:0;
      font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      background:var(--bg);
      color:var(--accent);
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      line-height:1.5;
    }
    .container{
      max-width:980px;
      margin:36px auto;
      padding:28px;
    }
    .card{
      background:var(--card);
      border-radius:12px;
      padding:26px;
      box-shadow:0 6px 24px rgba(12,30,60,0.06);
      border:1px solid var(--border);
    }
    header h1{
      margin:0 0 6px 0;
      font-size:28px;
      letter-spacing:-0.3px;
    }
    header p.lead{
      margin:0;
      color:var(--muted);
    }

    section{margin-top:20px}
    h2{margin:0 0 10px 0; font-size:18px}
    p{margin:0 0 12px 0; color:#273142}
    ul{margin:8px 0 12px 20px}
    pre{background:#0b1220;color:#d0f0ff;padding:14px;border-radius:8px;overflow:auto;font-family:var(--mono);font-size:13px}
    code{font-family:var(--mono);font-size:13px;background:#f1f5f9;padding:2px 6px;border-radius:6px;color:#0b1220}
    .grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:12px;
    }
    .pill{display:inline-block;padding:6px 10px;border-radius:20px;background:#eef7f7;color:var(--accent-2);font-weight:600;font-size:13px}
    footer{margin-top:20px;color:var(--muted);font-size:13px}
    .cta{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:8px;background:linear-gradient(90deg,var(--accent-2),#06b6d4);color:white;text-decoration:none}
    .subtle{color:var(--muted);font-size:13px}
    .code-block{background:#0f172a;color:#e6f6f6;padding:12px;border-radius:8px;overflow:auto;}
    @media (max-width:520px){
      .container{padding:16px;margin:16px}
      header h1{font-size:20px}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <header>
        <h1>DeshaDarsana</h1>
        <p class="lead">AI-Powered Local Experience Discovery Platform</p>
      </header>

      <section>
        <h2>Overview</h2>
        <p>
          <strong>DeshaDarsana</strong> is an AI-driven web and mobile platform that helps users discover authentic local experiences—
          including food, culture, hidden gems, events, workshops, and optimized micro-itineraries.
          The product provides context-aware, personalized recommendations using real-time signals such as location, time, weather,
          user preferences, budget, mood, and current events.
        </p>
      </section>

      <section>
        <h2>Key Features</h2>
        <div class="grid">
          <div>
            <h3 class="subtle">AI Chatbot Local Guide</h3>
            <p class="subtle">Ask natural questions like “Best street food near me?” or “Any cultural events tonight?” and receive curated answers in seconds.</p>
          </div>
          <div>
            <h3 class="subtle">Personalized Recommendations</h3>
            <p class="subtle">Recommendations tuned to user behavior, interests, and real-time context.</p>
          </div>
          <div>
            <h3 class="subtle">Hidden Gems Finder</h3>
            <p class="subtle">Surface lesser-known local spots that mainstream apps often miss.</p>
          </div>
          <div>
            <h3 class="subtle">Event & Activity Discovery</h3>
            <p class="subtle">Aggregate local workshops, meetups, festivals, and student-friendly activities.</p>
          </div>
          <div>
            <h3 class="subtle">Smart Mini-Itinerary Generator</h3>
            <p class="subtle">Generate micro-itineraries for 1–3 hours, half-day, and full-day plans optimized by distance and time.</p>
          </div>
          <div>
            <h3 class="subtle">Community Reviews & Contributions</h3>
            <p class="subtle">Allow locals and travelers to add places, write reviews, and share tips.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Tech Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> React / Flutter</li>
          <li><strong>Backend:</strong> Node.js / Firebase</li>
          <li><strong>AI Integration:</strong> OpenAI API / Google Gemini</li>
          <li><strong>Database:</strong> MongoDB / Firebase Firestore</li>
          <li><strong>Maps & Location:</strong> Google Maps API / Mapbox</li>
        </ul>
      </section>

      <section>
        <h2>High-Level Architecture</h2>
        <p>The platform is composed of the following modules:</p>
        <ul>
          <li>Authentication & User Profile</li>
          <li>User Preference Engine</li>
          <li>AI Recommendation Engine (context-aware)</li>
          <li>Experience Discovery & Aggregation</li>
          <li>Events Aggregator</li>
          <li>Maps & Navigation Layer</li>
          <li>Reviews & Community System</li>
          <li>Admin Dashboard & Analytics</li>
        </ul>
      </section>

      <section>
        <h2>Suggested Folder Structure</h2>
        <pre><code>
/src
  /components        # UI components
  /pages             # Screens / pages
  /services          # API & business logic services
  /context           # Global state management
  /utils             # Helper functions
  /hooks             # Reusable React/Flutter hooks
  /assets            # Images, icons, styles
  /api               # Backend API calls
        </code></pre>
      </section>

      <section>
        <h2>Usage & Purpose</h2>
        <p>
          DeshaDarsana aims to create value for:
        </p>
        <ul>
          <li><strong>Tourists:</strong> Smarter exploration and authentic experiences.</li>
          <li><strong>Local Businesses:</strong> Increased visibility and footfall.</li>
          <li><strong>Cities/Tourism Boards:</strong> Promote culture, manage crowds, and boost local economies.</li>
          <li><strong>Students & Locals:</strong> Discover affordable events and activities nearby.</li>
        </ul>
      </section>

      <section>
        <h2>Future Enhancements</h2>
        <ul>
          <li>AR-based virtual previews of locations</li>
          <li>Crowd-density predictions and heatmaps</li>
          <li>Offline mode for remote travel</li>
          <li>Voice-based AI assistant</li>
          <li>Gamification (points, badges, discovery challenges)</li>
        </ul>
      </section>

      <section>
        <h2>Contributing</h2>
        <p>
          Contributions are welcome. Please follow these high-level steps:
        </p>
        <ol>
          <li>Fork the repository</li>
          <li>Create a feature branch (<code>git checkout -b feature/your-feature</code>)</li>
          <li>Make changes and add tests where applicable</li>
          <li>Open a Pull Request with a clear description of the changes</li>
        </ol>
        <p class="subtle">Consider opening issues for bugs or feature ideas before large PRs.</p>
      </section>

      <section>
        <h2>License</h2>
        <p>This project is licensed under the <strong>MIT License</strong>.</p>
      </section>

      <footer>
        <div class="grid" style="align-items:center">
          <div>
            <span class="pill">DeshaDarsana</span>
          </div>
          <div style="text-align:right">
            <a class="cta" href="#" onclick="alert('Download README HTML or copy to your repo.'); return false;">Use this README</a>
          </div>
        </div>

        <p style="margin-top:12px" class="subtle">Generated for your hackathon project. Modify the tech stack and configuration sections to match your actual implementation before publishing.</p>
      </footer>
    </div>
  </div>
</body>
</html>
