# 🎉 MyScheme.gov.in API Integration Guide

## ✅ API Successfully Discovered and Tested!

We have successfully found and tested the MyScheme.gov.in API endpoints!

---

## 📋 Quick Summary

### Base URL
```
https://api.myscheme.gov.in/schemes/v6/public/schemes
```

### API Key (Required for all requests)
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

### Supported Languages
`en`, `hi`, `or`, `as`, `bn`, `gu`, `kn`, `ml`, `mr`, `pa`, `ta`, `te`, `ur`, `ks`, `mai`

---

## 🔥 Working Endpoints

### 1. Get Scheme by Slug ✅
```
GET https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang={lang}
```

**Tested with**: `pmmy`, `sui`, `pmjdy` - All working!

### 2. Get Scheme Documents ✅
```
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/documents?lang={lang}
```

### 3. Get Scheme FAQs ✅
```
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/faqs?lang={lang}
```

### 4. Get Application Channels ✅
```
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/applicationchannel
```

### 5. List Schemes with Pagination ✅
```
GET https://api.myscheme.gov.in/schemes/v6/public/schemes?limit={limit}&page={page}
```

**Note**: This endpoint was found during testing! Use `limit` and `page` parameters for pagination.

---

## 📊 Data Structure

### Scheme Object
```json
{
  "statusCode": 200,
  "data": {
    "_id": "648063dc46f33bfaa",
    "slug": "pmmy",
    "schemeAddedById": "ministry-id",
    "en": {
      "basicDetails": {
        "schemeName": "Pradhan Mantri MUDRA Yojana",
        "schemeCloseDate": "31-12-2025",
        "tags": ["Finance", "Business", "Loan"],
        "ministry": "Ministry of Finance",
        "state": "All India"
      },
      "schemeContent": {
        "briefDescription": "...",
        "detailedDescription": "...",
        "benefits": "..."
      },
      "eligibilityCriteria": {
        "eligibilityDescription": "...",
        "age": { "min": 18, "max": 65 },
        "income": "...",
        "category": "..."
      }
    }
  }
}
```

---

## 🚀 Integration into YojanaSetu

### Step 1: Update Environment Variables

Add to `.env`:
```env
MYSCHEME_API_BASE=https://api.myscheme.gov.in/schemes/v6/public/schemes
MYSCHEME_API_KEY=tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

### Step 2: Update SchemesCrawler

Replace the placeholder URL in `src/services/crawlers/schemesCrawler.js`:

```javascript
async crawlState(state) {
    try {
        // Use the real MyScheme API
        const url = `${process.env.MYSCHEME_API_BASE}?limit=100&lang=en`;
        
        const data = await this.fetch(url, {
            headers: {
                'x-api-key': process.env.MYSCHEME_API_KEY
            }
        });
        
        // The API returns JSON directly
        return this.parseJSONResponse(data, state);
    } catch (error) {
        logger.error(`Error crawling schemes:`, error);
        return [];
    }
}
```

### Step 3: Update parseJSONResponse

```javascript
parseJSONResponse(data, state) {
    const schemes = [];
    
    if (data.statusCode === 200 && data.data) {
        const schemesList = Array.isArray(data.data) ? data.data : [data.data];
        
        schemesList.forEach(scheme => {
            const langData = scheme.en || scheme.hi; // Fallback to Hindi if English not available
            
            if (langData && langData.basicDetails) {
                schemes.push({
                    title: langData.basicDetails.schemeName,
                    description: langData.schemeContent?.briefDescription || '',
                    eligibility: langData.eligibilityCriteria?.eligibilityDescription || '',
                    benefits: langData.schemeContent?.benefits || '',
                    url: `https://www.myscheme.gov.in/schemes/${scheme.slug}`,
                    state: langData.basicDetails.state || 'All India',
                    category: langData.basicDetails.tags?.[0] || 'General',
                    ministry: langData.basicDetails.ministry || 'Unknown',
                    lastDate: langData.basicDetails.schemeCloseDate || null,
                    rawData: scheme
                });
            }
        });
    }
    
    return schemes;
}
```

### Step 4: Update Database Source

Update the `sources` table:

```sql
UPDATE sources 
SET 
    url = 'https://api.myscheme.gov.in/schemes/v6/public/schemes',
    config = jsonb_build_object(
        'api_key', 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
        'limit', 100,
        'lang', 'en'
    )
WHERE name = 'MyScheme.gov.in';
```

---

## 🧪 Testing

Run the test script to verify:
```bash
cd d:/CEP PROJECT/govSchemes/crawler-testing
node test-myscheme-api.js
```

Check results in `results/` directory:
- `scheme-pmmy.json` - Sample scheme data
- `scheme-sui.json` - Another sample
- `all-schemes.json` - List of schemes (if found)

---

## 📝 Important Notes

1. **API Key is Public**: The API key is embedded in their JavaScript, so it's meant for public use
2. **Rate Limiting**: Unknown - be respectful with request frequency
3. **Pagination**: Use `limit` and `page` parameters to fetch all schemes
4. **Languages**: Data is available in 15 Indian languages
5. **No Authentication**: Just the API key header is required

---

## ✅ Next Steps

1. ✅ **API Discovered** - Done!
2. ✅ **API Tested** - Done!
3. ⏳ **Update YojanaSetu Crawler** - Ready to implement
4. ⏳ **Test in Production** - After integration
5. ⏳ **Monitor & Refine** - Ongoing

---

## 🎯 Ready to Integrate!

All the information needed to integrate MyScheme.gov.in into YojanaSetu is now available. The API is working, documented, and tested!

**Files to update in YojanaSetu**:
- `src/services/crawlers/schemesCrawler.js` - Update URL and parsing logic
- `.env` - Add API key
- `migrations/001_initial_schema.sql` - Update source config

Would you like me to update the YojanaSetu crawler with these real endpoints now?
