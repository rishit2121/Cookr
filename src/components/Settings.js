import React, { useState } from 'react';
import { migrateUsernames } from '../utils/migrateUsernames';

const Settings = () => {
  const [migrationStatus, setMigrationStatus] = useState('');

  const handleMigration = async () => {
    try {
      setMigrationStatus('Migrating usernames...');
      const count = await migrateUsernames();
      setMigrationStatus(`Successfully migrated ${count} usernames!`);
    } catch (error) {
      setMigrationStatus('Error during migration: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Settings</h2>
      <button 
        onClick={handleMigration}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Migrate Usernames
      </button>
      {migrationStatus && (
        <p style={{ color: migrationStatus.includes('Error') ? 'red' : 'green' }}>
          {migrationStatus}
        </p>
      )}
    </div>
  );
};

export default Settings; 