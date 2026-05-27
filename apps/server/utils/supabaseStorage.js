const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadFile(buffer, filename, mimetype, bucket = 'uploads') {
  console.log('SUPABASE UPLOAD:', filename, 'to bucket:', bucket);
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) {
    console.error('SUPABASE UPLOAD ERROR:', error.message);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  console.log('SUPABASE PUBLIC URL:', urlData.publicUrl);
  return urlData.publicUrl;
}

module.exports = { supabase, uploadFile };
