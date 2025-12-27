import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function testPresignedUrl() {
  console.log('=== Test de Presigned URL ===\n');
  
  const region = process.env.AWS_REGION || 'us-east-2';
  const bucket = process.env.AWS_S3_BUCKET || '';

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const testKey = `test/presigned-${Date.now()}.txt`;
  const testContent = 'Test content ' + new Date().toISOString();
  
  // Test 1: Sin ContentType en el command, solo host en signableHeaders
  console.log('Test 1: Sin ContentType, signableHeaders: [host]');
  try {
    const command1 = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey + '-1',
    });
    
    const url1 = await getSignedUrl(s3, command1, {
      expiresIn: 300,
      signableHeaders: new Set(['host']),
    });
    
    console.log('URL generada (primeros 100 chars):', url1.substring(0, 100));
    
    const response1 = await fetch(url1, {
      method: 'PUT',
      body: testContent,
    });
    
    if (response1.ok) {
      console.log('✅ Test 1 EXITOSO\n');
    } else {
      console.log('❌ Test 1 FALLÓ:', response1.status);
      const error = await response1.text();
      // Mostrar solo el código de error
      const match = error.match(/<Code>([^<]+)<\/Code>/);
      console.log('Error:', match ? match[1] : error.substring(0, 200), '\n');
    }
  } catch (e: any) {
    console.log('❌ Test 1 ERROR:', e.message, '\n');
  }

  // Test 2: Sin signableHeaders (default del SDK)
  console.log('Test 2: Sin signableHeaders (default del SDK)');
  try {
    const command2 = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey + '-2',
    });
    
    const url2 = await getSignedUrl(s3, command2, {
      expiresIn: 300,
      // Sin signableHeaders - usa el default
    });
    
    console.log('URL generada (primeros 100 chars):', url2.substring(0, 100));
    
    const response2 = await fetch(url2, {
      method: 'PUT',
      body: testContent,
    });
    
    if (response2.ok) {
      console.log('✅ Test 2 EXITOSO\n');
    } else {
      console.log('❌ Test 2 FALLÓ:', response2.status);
      const error = await response2.text();
      const match = error.match(/<Code>([^<]+)<\/Code>/);
      console.log('Error:', match ? match[1] : error.substring(0, 200), '\n');
    }
  } catch (e: any) {
    console.log('❌ Test 2 ERROR:', e.message, '\n');
  }

  // Test 3: Con ContentType en command y en signableHeaders
  console.log('Test 3: Con ContentType en command y signableHeaders');
  try {
    const command3 = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey + '-3',
      ContentType: 'text/plain',
    });
    
    const url3 = await getSignedUrl(s3, command3, {
      expiresIn: 300,
      signableHeaders: new Set(['host', 'content-type']),
    });
    
    console.log('URL generada (primeros 100 chars):', url3.substring(0, 100));
    
    const response3 = await fetch(url3, {
      method: 'PUT',
      body: testContent,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    if (response3.ok) {
      console.log('✅ Test 3 EXITOSO\n');
    } else {
      console.log('❌ Test 3 FALLÓ:', response3.status);
      const error = await response3.text();
      const match = error.match(/<Code>([^<]+)<\/Code>/);
      console.log('Error:', match ? match[1] : error.substring(0, 200), '\n');
    }
  } catch (e: any) {
    console.log('❌ Test 3 ERROR:', e.message, '\n');
  }

  console.log('=== Fin de tests ===');
}

testPresignedUrl();

