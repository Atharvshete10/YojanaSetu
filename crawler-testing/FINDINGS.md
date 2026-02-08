# MyScheme.gov.in API Endpoints - DISCOVERED! ✅

## 🎯 Base URL
```
https://api.myscheme.gov.in/schemes/v6/public/schemes
```

## 🔑 API Key (Required)
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

---

## 📋 Endpoints

### 1. Get Scheme by Slug
**URL**: `https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={slug}&lang={lang}`

**Method**: GET

**Headers**:
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

**Parameters**:
- `slug` (required): Scheme identifier (e.g., "pmmy", "sui")
- `lang` (optional): Language code (default: "en")
  - Supported: en, hi, or, as, bn, gu, kn, ml, mr, pa, ta, te, ur, ks, mai

**Example**:
```bash
curl "https://api.myscheme.gov.in/schemes/v6/public/schemes?slug=pmmy&lang=en" \
  -H "x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
```

**Response Structure**:
```json
{
  "statusCode": 200,
  "data": {
    "_id": "scheme-id",
    "slug": "pmmy",
    "en": {
      "basicDetails": {
        "schemeName": "Pradhan Mantri MUDRA Yojana",
        "schemeCloseDate": "DD-MM-YYYY",
        "tags": ["Finance", "Business"]
      },
      "schemeContent": {
        "briefDescription": "...",
        "detailedDescription": "..."
      },
      "eligibilityCriteria": {
        "eligibilityDescription": "..."
      }
    },
    "schemeAddedById": "..."
  }
}
```

---

### 2. Get Scheme Documents
**URL**: `https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/documents?lang={lang}`

**Method**: GET

**Headers**:
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

**Parameters**:
- `schemeId` (required): The `_id` from the scheme data
- `lang` (optional): Language code (default: "en")

**Example**:
```bash
curl "https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/documents?lang=en" \
  -H "x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
```

**Response Structure**:
```json
{
  "statusCode": 200,
  "data": {
    "en": {
      "documents_required": [
        {
          "documentName": "Aadhaar Card",
          "documentDescription": "..."
        }
      ]
    }
  }
}
```

---

### 3. Get Scheme FAQs
**URL**: `https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/faqs?lang={lang}`

**Method**: GET

**Headers**:
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

**Parameters**:
- `schemeId` (required): The `_id` from the scheme data
- `lang` (optional): Language code (default: "en")

**Example**:
```bash
curl "https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/faqs?lang=en" \
  -H "x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
```

**Response Structure**:
```json
{
  "statusCode": 200,
  "data": {
    "en": {
      "faqs": [
        {
          "question": "What is this scheme?",
          "answer": "..."
        }
      ]
    }
  }
}
```

---

### 4. Get Application Channels
**URL**: `https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/applicationchannel`

**Method**: GET

**Headers**:
```
x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc
```

**Parameters**:
- `schemeId` (required): The `_id` from the scheme data

**Example**:
```bash
curl "https://api.myscheme.gov.in/schemes/v6/public/schemes/{schemeId}/applicationchannel" \
  -H "x-api-key: tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
```

**Response Structure**:
```json
{
  "statusCode": 200,
  "data": {
    "applicationChannel": [
      {
        "applicationName": "UMANG",
        "applicationUrl": "https://..."
      },
      {
        "applicationName": "MyScheme",
        "applicationUrl": "https://..."
      }
    ]
  }
}
```

---

## 🔍 Missing: List All Schemes Endpoint

**⚠️ IMPORTANT**: The code above only shows how to fetch a **single scheme by slug**. We still need to find the endpoint to **list all schemes**.

### Possible Endpoints to Test:
```
https://api.myscheme.gov.in/schemes/v6/public/schemes
https://api.myscheme.gov.in/schemes/v6/public/schemes/list
https://api.myscheme.gov.in/schemes/v6/public/schemes/all
https://api.myscheme.gov.in/schemes/v6/public/search
```

---

## 📊 Data Structure Summary

### Scheme Object (Multilingual)
```javascript
{
  "_id": "unique-id",
  "slug": "scheme-slug",
  "schemeAddedById": "ministry-id",
  "en": {  // Language-specific data
    "basicDetails": {
      "schemeName": "string",
      "schemeCloseDate": "DD-MM-YYYY",
      "tags": ["tag1", "tag2"]
    },
    "schemeContent": {
      "briefDescription": "string",
      "detailedDescription": "string"
    },
    "eligibilityCriteria": {
      "eligibilityDescription": "string"
    }
  },
  "hi": { ... },  // Hindi
  // Other languages...
}
```

---

## 🎯 Next Steps

1. ✅ **Found the API endpoint and API key**
2. ⏳ **Need to find**: Endpoint to list all schemes (not just by slug)
3. ⏳ **Test the endpoints** with the provided API key
4. ⏳ **Update YojanaSetu crawler** with real endpoints

---

## 💡 How to Find "List All Schemes" Endpoint

1. Go to https://www.myscheme.gov.in/search
2. Open DevTools Network tab
3. Perform a search or browse schemes
4. Look for API calls that return **multiple schemes**
5. Document the endpoint here

---

## 🚀 Ready to Test!

Run the test script to verify these endpoints work:
```bash
node test-myscheme-api.js
```
