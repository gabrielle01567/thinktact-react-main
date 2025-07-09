import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://hqjzsdcolaltekoaxddc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
console.log('🔍 Anon Key length:', supabaseAnonKey.length);

if (supabaseAnonKey === 'your-anon-key-here') {
  console.log('❌ Please set your VITE_SUPABASE_ANON_KEY environment variable');
  console.log('💡 You can find your anon key in your Supabase dashboard:');
  console.log('   Settings → API → Project API keys → anon public');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log('\n🔍 Testing Supabase Storage...');
  
  try {
    // 1. Test basic connection first
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      console.log('💡 This suggests an authentication issue with your anon key.');
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // 2. List buckets to see if patent-images exists
    console.log('\n2. Checking available buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      console.log('💡 This might be a permissions issue or invalid anon key.');
      return;
    }
    
    console.log('✅ Available buckets:', buckets.map(b => b.name));
    
    const patentImagesBucket = buckets.find(b => b.name === 'patent-images');
    
    if (!patentImagesBucket) {
      console.log('❌ patent-images bucket does not exist!');
      console.log('💡 You need to create the bucket in your Supabase dashboard.');
      console.log('   Go to Storage → New Bucket → Name: patent-images → Public');
      return;
    }
    
    console.log('✅ patent-images bucket exists');
    console.log('   Public:', patentImagesBucket.public);
    console.log('   File size limit:', patentImagesBucket.file_size_limit);
    
    // 3. Try to list files in the bucket
    console.log('\n3. Testing bucket access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('patent-images')
      .list();
    
    if (filesError) {
      console.error('❌ Error accessing bucket:', filesError);
      console.log('💡 This might be a permissions issue. Check your bucket policies.');
      return;
    }
    
    console.log('✅ Bucket access successful');
    console.log('   Files in bucket:', files.length);
    
    // 4. Test upload with a small test file
    console.log('\n4. Testing upload...');
    const testContent = 'test file content';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patent-images')
      .upload(`test/${testFileName}`, testFile);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('💡 Check your bucket policies and make sure uploads are allowed.');
      return;
    }
    
    console.log('✅ Upload test successful:', uploadData.path);
    
    // 5. Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('patent-images')
      .remove([`test/${testFileName}`]);
    
    if (deleteError) {
      console.log('⚠️ Could not delete test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('\n🎉 Storage test completed successfully!');
    console.log('💡 Your Supabase Storage is properly configured.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStorage(); 