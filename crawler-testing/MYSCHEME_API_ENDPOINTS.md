# MyScheme API Endpoints - Extracted from Source Code

## 🎯 Discovered API Endpoints

From the MyScheme.gov.in source code (Next.js bundle), here are the **actual endpoints** being used:

### Base URL
```
https://api.myscheme.gov.in/schemes/v6/public/schemes
```

### API Key (from source)
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

### Endpoints Used

#### 1. List Schemes
```javascript
GET https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang={lang}
Headers:
  x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

#### 2. Get Scheme Documents
```javascript
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/documents?lang={lang}
Headers:
  x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

#### 3. Get Scheme FAQs
```javascript
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/faqs?lang={lang}
Headers:
  x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

#### 4. Get Application Channels
```javascript
GET https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/applicationchannel
Headers:
  x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

## 📊 Response Structure

### Main Scheme Response
```json
{
  "statusCode": 200,
  "data": {
    "_id": "scheme-id",
    "en": {
      "basicDetails": {
        "schemeName": "Scheme Name",
        "schemeCloseDate": "DD-MM-YYYY",
        "tags": ["tag1", "tag2"]
      },
      "schemeContent": {
        "briefDescription": "Description..."
      },
      "eligibilityCriteria": {
        "eligibilityDescription": "..."
      }
    }
  }
}
```

## ⚠️ Key Findings

1. **Query Parameter**: The API uses `?slug={slug}` instead of `?limit=X&offset=Y` for individual schemes
2. **Language Support**: All endpoints require `lang` parameter (en, hi, etc.)
3. **Nested Structure**: Data is nested under language code (e.g., `data.en.basicDetails`)
4. **Multiple Endpoints**: Scheme details are split across 4 different endpoints

## 🔧 What We Need to Change

Our crawler is currently trying to fetch a **list** of schemes with pagination:
```
GET /schemes/v6/public/schemes?limit=50&offset=0&lang=en
```

But the API might not support this format. We need to either:
1. Find the correct list endpoint
2. Use a search endpoint
3. Load schemes from a different source

## 🚀 Next Steps

1. Test if the list endpoint works with different parameters
2. Look for a search/filter endpoint in the source code
3. Consider using the sample data loader as fallback
