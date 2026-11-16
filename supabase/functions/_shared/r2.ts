// TODO (F3): cliente S3 para R2 (aws4fetch o @aws-sdk/client-s3)
// - presignPut(bucket, key, mime, ttl)
// - presignGet(bucket, key, ttl)
export const R2 = {
  endpoint: `https://${Deno.env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  originals: Deno.env.get('R2_BUCKET_ORIGINALS') ?? 'originals',
  previews: Deno.env.get('R2_BUCKET_PREVIEWS') ?? 'previews',
}
