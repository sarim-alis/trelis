import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      refreshToken: String
    }, { timestamps: true }));
    
    const users = await User.find({});
    console.log('\n=== USERS IN DATABASE ===');
    console.log('Total users:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log('  ID:', user._id);
        console.log('  Username:', user.username);
        console.log('  Email:', user.email);
        console.log('  Created:', user.createdAt);
      });
    } else {
      console.log('No users found in database!');
    }
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkUsers();
