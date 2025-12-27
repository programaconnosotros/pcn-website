import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function testDirectUpload() {
  console.log('=== Test de Upload Directo con SDK ===\n');

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
  const region = process.env.AWS_REGION || 'us-east-2';
  const bucket = process.env.AWS_S3_BUCKET || '';

  // Mostrar info de las credenciales (sin revelar todo)
  console.log('Credenciales:');
  console.log(
    '  Access Key ID:',
    accessKeyId.substring(0, 4) + '...' + accessKeyId.substring(accessKeyId.length - 4),
  );
  console.log('  Secret Key length:', secretAccessKey.length, 'caracteres');
  console.log('  Secret Key primeros 4:', secretAccessKey.substring(0, 4) + '...');
  console.log('  Region:', region);
  console.log('  Bucket:', bucket);
  console.log('');

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const testKey = `test/direct-${Date.now()}.txt`;

  console.log('Intentando subir a:', testKey);

  try {
    const result = await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: testKey,
        Body: 'Test content ' + new Date().toISOString(),
        ContentType: 'text/plain',
      }),
    );

    console.log('\n✅ ¡Upload EXITOSO!');
    console.log('ETag:', result.ETag);
    console.log('\nEl problema NO son las credenciales.');
    console.log('El problema está en la generación/uso de presigned URLs.');
  } catch (error: any) {
    console.log('\n❌ Upload FALLÓ');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.Code || error.$metadata?.httpStatusCode);

    if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
      console.log('\n→ El usuario IAM NO tiene permiso s3:PutObject');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n→ Las credenciales están MAL (secret key incorrecto)');
    }
  }
}

testDirectUpload();
