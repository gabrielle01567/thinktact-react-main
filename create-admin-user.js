import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Creating admin user...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    const email = 'alex.hawke54@gmail.com';
    const password = 'admin123';
    
    console.log(`Creating admin user: ${email}`);
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError.message);
      return;
    }
    
    if (existingUser) {
      console.log('⚠️  User already exists, updating to admin...');
      
      // Update existing user to admin
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          is_verified: true,
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        return;
      }
      
      console.log('✅ User updated successfully!');
      console.log('User details:', {
        id: updateData[0].id,
        email: updateData[0].email,
        is_verified: updateData[0].is_verified,
        is_admin: updateData[0].is_admin,
        created_at: updateData[0].created_at
      });
      
    } else {
      console.log('Creating new admin user...');
      
      // Create new admin user
      const newUser = {
        email: email,
        password_hash: passwordHash,
        is_verified: true,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select();
      
      if (insertError) {
        console.error('❌ Error creating user:', insertError.message);
        return;
      }
      
      console.log('✅ Admin user created successfully!');
      console.log('User details:', {
        id: insertData[0].id,
        email: insertData[0].email,
        is_verified: insertData[0].is_verified,
        is_admin: insertData[0].is_admin,
        created_at: insertData[0].created_at
      });
    }
    
    console.log('\n🎉 Admin user setup completed!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Status: Verified Admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the function
createAdminUser(); 