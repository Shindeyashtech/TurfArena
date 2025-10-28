const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get User collection
    const usersCollection = db.collection('users');
    
    // Drop the problematic index
    try {
      await usersCollection.dropIndex('location.coordinates_2dsphere');
      console.log('Dropped old geo index');
    } catch (error) {
      console.log('No old index to drop');
    }
    
    // Create new sparse index
    await usersCollection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { sparse: true }
    );
    console.log('Created new sparse geo index');
    
    // Fix existing documents with invalid coordinates
    const result = await usersCollection.updateMany(
      {
        $or: [
          { 'location.coordinates.coordinates': { $exists: false } },
          { 'location.coordinates.coordinates': { $not: { $type: 'array' } } }
        ]
      },
      {
        $set: { 'location.coordinates.coordinates': [0, 0] }
      }
    );
    
    console.log(`Fixed ${result.modifiedCount} documents`);
    
    // Do the same for Teams collection
    const teamsCollection = db.collection('teams');
    try {
      await teamsCollection.dropIndex('location.coordinates_2dsphere');
      console.log('Dropped old team geo index');
    } catch (error) {
      console.log('No old team index to drop');
    }
    
    await teamsCollection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { sparse: true }
    );
    console.log('Created new team geo index');
    
    // Fix team documents
    const teamResult = await teamsCollection.updateMany(
      {
        $or: [
          { 'location.coordinates.coordinates': { $exists: false } },
          { 'location.coordinates.coordinates': { $not: { $type: 'array' } } }
        ]
      },
      {
        $set: { 'location.coordinates.coordinates': [0, 0] }
      }
    );
    
    console.log(`Fixed ${teamResult.modifiedCount} team documents`);
    
    // Do the same for Turfs collection
    const turfsCollection = db.collection('turfs');
    try {
      await turfsCollection.dropIndex('location.coordinates_2dsphere');
      console.log('Dropped old turf geo index');
    } catch (error) {
      console.log('No old turf index to drop');
    }
    
    await turfsCollection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { sparse: true }
    );
    console.log('Created new turf geo index');
    
    // Fix turf documents
    const turfResult = await turfsCollection.updateMany(
      {
        $or: [
          { 'location.coordinates.coordinates': { $exists: false } },
          { 'location.coordinates.coordinates': { $not: { $type: 'array' } } }
        ]
      },
      {
        $set: { 'location.coordinates.coordinates': [0, 0] }
      }
    );
    
    console.log(`Fixed ${turfResult.modifiedCount} turf documents`);
    
    console.log('All indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
