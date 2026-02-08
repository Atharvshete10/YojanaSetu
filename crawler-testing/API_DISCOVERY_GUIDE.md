# MyScheme.gov.in API Endpoint Discovery Guide

## 🎯 Objective
Find the actual API endpoints used by MyScheme.gov.in to fetch scheme data so we can integrate them into the YojanaSetu crawler.

## 🔍 Manual Discovery Process

### Step 1: Open Browser DevTools

1. **Open Chrome/Firefox**
2. **Navigate to**: https://www.myscheme.gov.in/search
3. **Press F12** to open DevTools
4. **Click on the "Network" tab**
5. **Filter by "Fetch/XHR"** (this shows API calls only)

### Step 2: Trigger API Calls

1. **Perform a search** or **apply filters** on the page
2. **Watch the Network tab** for new requests
3. **Look for requests** that:
   - Start with `/api/`
   - Return JSON data
   - Contain scheme information

### Step 3: Analyze the API Endpoint

Once you see an API request:

1. **Click on the request** in the Network tab
2. **Check the "Headers" tab** to see:
   - Request URL (full endpoint)
   - Request Method (GET/POST)
   - Query Parameters
3. **Check the "Response" tab** to see:
   - Data structure
   - Field names (title, description, eligibility, etc.)
4. **Check the "Payload" tab** (if POST) to see:
   - Request body structure

### Step 4: Test the Endpoint

Copy the full URL from the Network tab and test it:

```bash
# Example (replace with actual URL):
curl "https://www.myscheme.gov.in/api/v1/schemes?limit=10" -H "User-Agent: Mozilla/5.0"
```

## 📊 What to Look For

### Common Endpoint Patterns

Based on Next.js/React apps, the API is likely:

```
https://www.myscheme.gov.in/api/v1/schemes
https://www.myscheme.gov.in/api/v1/search
https://www.myscheme.gov.in/api/v1/query
https://www.myscheme.gov.in/_next/data/{buildId}/search.json
```

### Expected Data Structure

The response will likely look like:

```json
{
  "schemes": [
    {
      "id": "scheme-123",
      "title": "PM Kisan Samman Nidhi",
      "description": "Financial support to farmers...",
      "eligibility": {
        "age": "18+",
        "income": "< 2 lakh",
        "state": "All India"
      },
      "benefits": "Rs 6000 per year",
      "applicationUrl": "https://...",
      "ministry": "Ministry of Agriculture",
      "category": "Agriculture"
    }
  ],
  "total": 100,
  "page": 1
}
```

## 🧪 Testing in Our Environment

Once you find the endpoint, add it to `custom-test.js`:

```javascript
const testSite = new TestCrawler({
    name: 'myscheme-api',
    baseUrl': 'https://www.myscheme.gov.in',
    testUrl: 'https://www.myscheme.gov.in/api/v1/schemes' // Replace with actual endpoint
});

await testSite.testEndpoint();
```

## 📝 Information to Collect

For each endpoint you find, document:

1. **Full URL**: `https://www.myscheme.gov.in/api/...`
2. **Method**: GET or POST
3. **Parameters**:
   - Query params (e.g., `?state=Delhi&limit=10`)
   - Body params (if POST)
4. **Headers Required**:
   - User-Agent
   - Authorization (if any)
   - Content-Type
5. **Response Structure**:
   - Field names
   - Data types
   - Nested objects
6. **Pagination**:
   - How to get next page
   - Total count field
   - Page size limits

## 🎯 Alternative: Check Next.js Data

Since this is a Next.js app, data might be embedded in the page:

1. **View Page Source** (Ctrl+U)
2. **Search for** `<script id="__NEXT_DATA__"`
3. **Copy the JSON** inside that script tag
4. **Format it** using a JSON formatter
5. **Look for scheme data** in the JSON

The JSON might contain:
- Initial data loaded with the page
- API endpoint URLs
- Build configuration

## 📋 Checklist

- [ ] Open DevTools Network tab
- [ ] Perform search/filter action
- [ ] Find API request in Network tab
- [ ] Copy full endpoint URL
- [ ] Check request parameters
- [ ] View response structure
- [ ] Test endpoint with curl/browser
- [ ] Document all findings
- [ ] Update `custom-test.js` with real endpoint
- [ ] Run test to verify it works

## 💡 Tips

- **Clear Network tab** before performing actions to see only new requests
- **Look for requests with JSON response** (Content-Type: application/json)
- **Check multiple pages** (search, scheme details, filters) to find all endpoints
- **Copy as cURL** - Right-click request → Copy → Copy as cURL
- **Check Console tab** for any errors that might reveal API structure

## 🚨 Common Issues

### CORS Errors
If you see CORS errors when testing:
- This is normal for browser-based testing
- Node.js crawlers won't have this issue
- The endpoint is still valid

### 403 Forbidden
If you get 403:
- Add proper User-Agent header
- Check if authentication is required
- Try copying all headers from the browser request

### 404 Not Found
If you get 404:
- Double-check the URL
- Verify query parameters
- Check if the endpoint requires specific headers

## 📤 What to Report Back

Once you've found the endpoints, create a file `FINDINGS.md` with:

```markdown
# MyScheme.gov.in API Findings

## Schemes Endpoint
- **URL**: https://www.myscheme.gov.in/api/v1/schemes
- **Method**: GET
- **Parameters**: 
  - state (optional): State name
  - limit (optional): Number of results
  - offset (optional): Pagination offset
- **Response**: JSON array of schemes
- **Sample**: (paste sample response)

## Scheme Details Endpoint
- **URL**: https://www.myscheme.gov.in/api/v1/schemes/{id}
- **Method**: GET
- **Response**: Single scheme object with full details

## Notes
- No authentication required
- Rate limiting: Unknown
- Data updates: Unknown frequency
```

---

**Ready to start?** Open https://www.myscheme.gov.in/search in your browser and follow the steps above!
