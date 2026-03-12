
/**
 * AZRE Email Client - AWS SES + Supabase Implementation
 * Backend: Supabase (PostgreSQL)
 * Mailer: AWS SES (Signature V4 - POST Payload Method)
 */

// --- CONFIGURATION & SETUP ---

function getAwsConfig() {
  const props = PropertiesService.getScriptProperties();
  const awsSecret = props.getProperty('AWS_SECRET_KEY');
  const sbKey = props.getProperty('SUPABASE_KEY');
  
  return {
    status: 'success',
    data: {
      sourceEmail: props.getProperty('SOURCE_EMAIL') || '',
      region: props.getProperty('AWS_REGION') || 'us-east-2',
      accessKey: props.getProperty('AWS_ACCESS_KEY') || '',
      secretKey: awsSecret ? '********' : '',
      supabaseUrl: props.getProperty('SUPABASE_URL') || '',
      supabaseKey: sbKey ? '********' : ''
    }
  };
}

function saveAwsConfig(data) {
  const props = PropertiesService.getScriptProperties();
  try {
    const updates = {
      'SOURCE_EMAIL': (data.sourceEmail || '').trim(),
      'AWS_REGION': (data.region || '').trim(),
      'AWS_ACCESS_KEY': (data.accessKey || '').trim(),
      'SUPABASE_URL': (data.supabaseUrl || '').trim()
    };
    
    // Only update secrets if they are provided and not masked
    if (data.secretKey && !data.secretKey.includes('*')) {
      updates['AWS_SECRET_KEY'] = data.secretKey.trim();
    }
    if (data.supabaseKey && !data.supabaseKey.includes('*')) {
      updates['SUPABASE_KEY'] = data.supabaseKey.trim();
    }

    props.setProperties(updates);
    return { status: 'success', message: 'Configuration saved successfully' };
  } catch (e) {
    return { status: 'error', message: "Failed to save config: " + e.toString() };
  }
}

// --- TEMPLATE MANAGEMENT (SUPABASE) ---

function getTemplates() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL');
  const key = props.getProperty('SUPABASE_KEY');

  if (!url || !key) return [];

  // Fetch all templates from 'EmailTemplates' table
  const endpoint = `${url}/rest/v1/EmailTemplates?select=*&order=id.asc`;
  
  const options = {
    method: 'get',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    } else {
      console.error("Supabase Error: " + response.getContentText());
      return [];
    }
  } catch (e) {
    console.error("Fetch Error: " + e.toString());
    return [];
  }
}

function saveTemplate(data) {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL');
  const key = props.getProperty('SUPABASE_KEY');

  if (!url || !key) return { status: 'error', message: 'Supabase Config missing' };

  // Prepare payload
  const payload = {
    name: data.name,
    type: data.type,
    html_content: data.html_content,
    is_default: data.is_default === true || data.is_default === "true"
  };

  // If updating (ID exists), add it to payload
  if (data.id) {
    payload.id = data.id;
  }

  const endpoint = `${url}/rest/v1/EmailTemplates`;
  
  // Prefer UPSERT: If ID exists update, else insert.
  const options = {
    method: 'post',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    // Supabase returns 201 for Created, 200/204 for OK
    if (response.getResponseCode() < 300) {
      return { status: 'success', message: 'Template saved' };
    } else {
      return { status: 'error', message: "Supabase Error: " + response.getContentText() };
    }
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function deleteTemplate(id) {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL');
  const key = props.getProperty('SUPABASE_KEY');

  const endpoint = `${url}/rest/v1/EmailTemplates?id=eq.${id}`;
  
  const options = {
    method: 'delete',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    if (response.getResponseCode() < 300) {
      return { status: 'success', message: 'Template deleted' };
    } else {
      return { status: 'error', message: "Supabase Error: " + response.getContentText() };
    }
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

// --- MAIN SENDING LOGIC ---

function processBulkEmail(payload) {
  const props = PropertiesService.getScriptProperties();
  
  // Credentials
  const accessKey = props.getProperty('AWS_ACCESS_KEY');
  const secretKey = props.getProperty('AWS_SECRET_KEY');
  const region = props.getProperty('AWS_REGION') || 'us-east-2';
  const sbUrl = props.getProperty('SUPABASE_URL');
  const sbKey = props.getProperty('SUPABASE_KEY');

  if (!accessKey || !secretKey || !region) return { error: "AWS Credentials missing." };

  try {
    const recipients = payload.recipients || []; 
    const recipientList = Array.isArray(recipients) ? recipients : JSON.parse(recipients);

    if (!recipientList || recipientList.length === 0) return { error: "No recipients provided" };

    const subject = payload.subject;
    // Allow payload.body OR payload.htmlBody for compatibility
    let bodyHtml = payload.body || payload.htmlBody;
    // Capture custom sender if provided
    const fromAddress = payload.fromAddress; 

    // --- TEMPLATE INJECTION (SUPABASE) ---
    // Only attempt fetch if a valid templateId is provided
    if (payload.templateId && sbUrl && sbKey) {
      try {
        const templateData = fetchTemplateFromSupabase(payload.templateId, sbUrl, sbKey);
        
        if (templateData && templateData.html_content) {
          const wrapperHtml = templateData.html_content;
          
          // CRITICAL FIX: Replace Go-style tags found in your template
          if (wrapperHtml.includes('{{ template "content" . }}')) {
             bodyHtml = wrapperHtml.replace('{{ template "content" . }}', bodyHtml);
          } 
          // Fallback for standard {{ Content }}
          else if (wrapperHtml.includes('{{ Content }}')) {
             bodyHtml = wrapperHtml.replace('{{ Content }}', bodyHtml);
          }
        }
      } catch (err) {
        console.error("Template Fetch Error: " + err.toString());
        // We continue sending the unwrapped body if template fetch fails
      }
    }

    let successCount = 0;
    let errors = [];

    recipientList.forEach(item => {
      const email = (typeof item === 'object') ? item.email : item;
      if (email && email.includes('@')) {
        try {
          // Pass fromAddress (which may be undefined) to sendSesEmail
          sendSesEmail(email, subject, bodyHtml, accessKey, secretKey, region, fromAddress);
          successCount++;
        } catch (err) {
          console.error("SES Error for " + email + ": " + err.toString());
          errors.push({ email: email, error: err.toString() });
        }
      }
    });

    const overallStatus = errors.length === 0 ? "success" : (successCount > 0 ? "partial_success" : "failure");
    return { status: overallStatus, sent_count: successCount, error_count: errors.length, errors: errors };
  } catch (e) {
    return { error: "Bulk Email Critical Failure: " + e.toString() };
  }
}

// --- HELPER: Fetch Single Template ---
function fetchTemplateFromSupabase(templateId, url, key) {
  // Targeting 'EmailTemplates' table
  const endpoint = `${url}/rest/v1/EmailTemplates?id=eq.${templateId}&select=html_content`;
  
  const options = {
    method: 'get',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  if (response.getResponseCode() !== 200) {
    console.error("Supabase Template Error: " + response.getContentText());
    return null;
  }

  const data = JSON.parse(response.getContentText());
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Signs and sends the AWS SES Request (Signature V4)
 * UPDATED: Uses POST Body for HTML content to avoid 414 URI Too Long errors
 * UPDATED: Supports custom sender (fromAddress)
 */
function sendSesEmail(toAddress, subject, htmlBody, accessKey, secretKey, region, customSender) {
  const method = 'POST';
  const service = 'email'; 
  const host = `email.${region}.amazonaws.com`;
  
  // Use custom sender if provided, otherwise fall back to script property
  const defaultSender = PropertiesService.getScriptProperties().getProperty('SOURCE_EMAIL');
  const sender = customSender || defaultSender;
  
  if (!sender) throw new Error("SOURCE_EMAIL property is missing and no custom sender provided.");

  // 1. amzDate & dateStamp
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);

  // 2. Prepare Parameters (Body Payload)
  const params = {
    'Action': 'SendEmail',
    'Source': sender,
    'Destination.ToAddresses.member.1': toAddress,
    'Message.Subject.Data': subject,
    'Message.Body.Html.Data': htmlBody
  };

  // 3. Create Sorted Parameter String (x-www-form-urlencoded)
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(key => 
    strictEncode(key) + '=' + strictEncode(params[key])
  ).join('&');

  // 4. Payload Hash
  const payloadHash = toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, paramString));

  // 5. Canonical Request
  const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  
  const canonicalRequest = [
    method,
    '/',
    '', // Empty Query String (Params are in Body)
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  // 6. String to Sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, canonicalRequest))
  ].join('\n');

  // 7. Calculate Signature
  const signingKeyBytes = getSignatureKey(secretKey, dateStamp, region, service);
  const stringToSignBytes = Utilities.newBlob(stringToSign).getBytes();
  const signature = toHex(Utilities.computeHmacSha256Signature(stringToSignBytes, signingKeyBytes));

  // 8. Headers & Execution
  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const fullUrl = `https://${host}/`;

  const options = {
    method: 'post',
    headers: {
      'Authorization': authorizationHeader,
      'X-Amz-Date': amzDate,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: paramString,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(fullUrl, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    throw new Error(`AWS SES API Error (${responseCode}): ${responseText}`);
  }
  return responseText;
}

// --- V8-STRICT HELPERS ---

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kSecret = Utilities.newBlob("AWS4" + key).getBytes();
  const kDate = Utilities.computeHmacSha256Signature(Utilities.newBlob(dateStamp).getBytes(), kSecret);
  const kRegion = Utilities.computeHmacSha256Signature(Utilities.newBlob(regionName).getBytes(), kDate);
  const kService = Utilities.computeHmacSha256Signature(Utilities.newBlob(serviceName).getBytes(), kRegion);
  const kSigning = Utilities.computeHmacSha256Signature(Utilities.newBlob("aws4_request").getBytes(), kService);
  return kSigning;
}

function strictEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function toHex(bytes) {
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function testAwsHandshake() {
  const props = PropertiesService.getScriptProperties();
  const targetEmail = props.getProperty('SOURCE_EMAIL');
  
  if (!targetEmail) return { status: 'error', message: 'Source email not set' };

  try {
    const testPayload = {
      recipients: [{ email: targetEmail }],
      subject: "AWS SES API Verification",
      body: "<h1>Handshake Success</h1><p>Your Google Apps Script has successfully authenticated with AWS SES using Signature V4 (POST).</p>"
    };
    return processBulkEmail(testPayload);
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}
