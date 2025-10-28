// Script to add database indexes for better query performance
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://yash_db_turf:yash_db_turf@turf.ouovq4d.mongodb.net/turfarena?retryWrites=true&w=majority&appName=turf";

async function addIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Add indexes for Users collection
    console.log('Adding indexes for Users...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ 'location.coordinates': '2dsphere' });

    // Add indexes for Turfs collection
    console.log('Adding indexes for Turfs...');
    await db.collection('turfs').createIndex({ owner: 1 });
    await db.collection('turfs').createIndex({ 'location.city': 1 });
    await db.collection('turfs').createIndex({ 'pricing.basePrice': 1 });
    await db.collection('turfs').createIndex({ 'ratings.average': -1 });
    await db.collection('turfs').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('turfs').createIndex({ 
      owner: 1, 
      'ratings.average': -1 
    });

    // Add indexes for Bookings collection
    console.log('Adding indexes for Bookings...');
    await db.collection('bookings').createIndex({ user: 1 });
    await db.collection('bookings').createIndex({ turf: 1 });
    await db.collection('bookings').createIndex({ bookingDate: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ 
      user: 1, 
      bookingDate: -1 
    });
    await db.collection('bookings').createIndex({ 
      turf: 1, 
      status: 1 
    });

    // Add indexes for Teams collection
    console.log('Adding indexes for Teams...');
    await db.collection('teams').createIndex({ captain: 1 });
    await db.collection('teams').createIndex({ 'members.user': 1 });
    await db.collection('teams').createIndex({ skillLevel: 1 });
    await db.collection('teams').createIndex({ status: 1 });

    // Add indexes for Matches collection
    console.log('Adding indexes for Matches...');
    await db.collection('matches').createIndex({ 'teamA.team': 1 });
    await db.collection('matches').createIndex({ 'teamB.team': 1 });
    await db.collection('matches').createIndex({ turf: 1 });
    await db.collection('matches').createIndex({ matchDate: 1 });
    await db.collection('matches').createIndex({ status: 1 });
    await db.collection('matches').createIndex({ 
      status: 1, 
      matchDate: -1 
    });

    // Add indexes for Notifications collection
    console.log('Adding indexes for Notifications...');
    await db.collection('notifications').createIndex({ user: 1 });
    await db.collection('notifications').createIndex({ isRead: 1 });
    await db.collection('notifications').createIndex({ 
      user: 1, 
      isRead: 1, 
      createdAt: -1 
    });

    // Add indexes for Payments collection
    console.log('Adding indexes for Payments...');
    await db.collection('payments').createIndex({ user: 1 });
    await db.collection('payments').createIndex({ booking: 1 });
    await db.collection('payments').createIndex({ razorpayOrderId: 1 });
    await db.collection('payments').createIndex({ status: 1 });

    // Add indexes for Chats collection
    console.log('Adding indexes for Chats...');
    await db.collection('chats').createIndex({ participants: 1 });
    await db.collection('chats').createIndex({ type: 1 });
    await db.collection('chats').createIndex({ updatedAt: -1 });

    console.log('✅ All indexes created successfully!');
    
    // List all indexes
    console.log('\n📊 Index Summary:');
    const collections = ['users', 'turfs', 'bookings', 'teams', 'matches', 'notifications', 'payments', 'chats'];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName}: ${indexes.length} indexes`);
    }

  } catch (error) {
    console.error('Error adding indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

addIndexes();
