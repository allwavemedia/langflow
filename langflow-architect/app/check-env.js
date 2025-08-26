// Simple script to check environment variables
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET')
console.log('NODE_ENV:', process.env.NODE_ENV)

// Load .env.local if needed
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('Found .env.local file:')
  console.log(envContent.split('\n').map(line => 
    line.startsWith('OPENAI_API_KEY') ? 'OPENAI_API_KEY=***[HIDDEN]***' : line
  ).join('\n'))
}
