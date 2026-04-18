
fetch('https://eprocure.gov.in/cppp/latestactivetenders', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive'
  }
})
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(html => {
    console.log('HTML Length:', html.length);
    console.log(html.substring(0, 500));
    
    // Check for captcha or block
    if (html.toLowerCase().includes('captcha')) console.log('CAPTCHA DETECTED!');
    if (html.toLowerCase().includes('access denied')) console.log('ACCESS DENIED!');
  })
  .catch(console.error);
