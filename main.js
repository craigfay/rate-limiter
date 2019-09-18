const { createServer } = require('http');

// Count client requests made recently
const hitCounts = {};
const hitsAllowedPerMinute = 50;
const hitCeiling = 1000;

// Start Http Server
function serveHttp() {
  const s = createServer(function(req, res) {
    // Increase client's hit count
    const ip = req.connection.remoteAddress;
    if (!hitCounts[ip]) hitCounts[ip] = 1;
    if (hitCounts[ip] < hitCeiling) hitCounts[ip] += 1;

    // Maybe deny their request
    if (hitCounts[ip] > hitsAllowedPerMinute) {
      const tryAgainTime = Math.ceil(hitCounts[ip] / hitsAllowedPerMinute);
      res.writeHead(429);
      res.end(`You've been rate limited. Try again in ${tryAgainTime} minutes.`);
    }
    
    // Respond Affirmatively
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(hitCounts, null, 2));
  })
  s.listen(80, () => console.log('listening...'));
}

// Decrease Hit Counter
function decreaseHits() {
  const ips = Object.keys(hitCounts);
  ips.forEach(ip => {
    if (hitCounts[ip] > 0) hitCounts[ip] -= hitsAllowedPerMinute;
    else (delete hitCounts[ip]);
  })
}

setInterval(decreaseHits, 1000 * 60);
serveHttp();
