import React, { useState } from 'react';
import axios from 'axios';

const UsernameChecker = () => {
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event) => {
        const inputUsername = event.target.value;
        setUsername(inputUsername);

        // Reset status when user modifies the input
        if (inputUsername.trim() === '') {
            setStatus('');
        }
    };

    const handleSubmit = async () => {
        // Step 1: Validate username length
        if (username.length < 5) {
            setStatus('⚠️ Username must be at least 5 characters long.');
            return;
        }

        // Step 2: Set loading state before making API call
        setIsLoading(true);
        setStatus('');

        try {
            // Make API call to check username availability
            const response = await axios.get('check-username api', {
                params: { username },
            });

            // Step 3: Handle API response
            if (response.data.isUnique) {
                setStatus('✅ Username is available!');
            } else {
                setStatus('❌ Username is already taken.');
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setStatus('⚠️ An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1>Check Username Availability</h1>
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={handleInputChange}
                style={styles.input}
            />
            <button onClick={handleSubmit} style={styles.button}>Submit</button>

            {isLoading ? (
                <p style={styles.loading}>Checking...</p>
            ) : (
                <p style={styles.status}>{status}</p>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007BFF',
        color: 'white',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '10px',
    },
    buttonDisabled: {
        backgroundColor: '#aaa',
        cursor: 'not-allowed',
    },
    status: {
        fontSize: '16px',
        fontWeight: 'bold',
    },
    loading: {
        fontSize: '16px',
        color: 'gray',
    },
};

export default UsernameChecker;
