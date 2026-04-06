const http = require('http');
      const fs = require('fs');
      const path = require('path');
      const base = 'C:/Users/hp/OneDrive/Desktop/dev1/DevDeploy/workdir/a1-77sqg9/Artisan Coffee Project';
      
      const server = http.createServer((req, res) => {
        let filePath = path.join(base, req.url === '/' ? 'index.html' : req.url);
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(base, 'index.html');
        }
        
        const ext = path.extname(filePath).toLowerCase();

        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading: ' + filePath);
          }
          const types = { 
            '.html': 'text/html', 
            '.js': 'text/javascript', 
            '.css': 'text/css', 
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.json': 'application/json'
          };
          res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
          res.end(content);
        });
      });
      server.listen(8001, '0.0.0.0', () => console.log('Static server bridge live on 8001'));