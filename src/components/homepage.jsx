import React, { useEffect, useState } from "react";
import { Auth } from "aws-amplify";

function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState("");
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        // Check user authentication and fetch profile data
        const authenticateAndFetchProfile = async () => {
            const isAuth = checkAuthentication();
            setIsAuthenticated(isAuth);

            if (isAuth) {
                try {
                    const user = await Auth.currentAuthenticatedUser();
                    setUserProfile({
                        username: user.username,
                        email: user.attributes.email,
                        name: user.attributes.name || "Guest", // Ensure this attribute is available in Cognito
                    });
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };

        authenticateAndFetchProfile();

        // Handle OAuth callback to process Google "code"
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            handleGoogleCallback(code);
        }
    }, []);

    // Function to check if id_token exists and is valid
    const checkAuthentication = () => {
        const idToken = localStorage.getItem("id_token");
        if (idToken) {
            try {
                const decodedToken = JSON.parse(atob(idToken.split(".")[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                return decodedToken.exp && decodedToken.exp > currentTime;
            } catch (error) {
                console.error("Error decoding id_token:", error);
                return false;
            }
        }
        return false;
    };

    // Function to redirect for Google OAuth flow
    const handleConnectWithGoogle = () => {
        const googleAuthURL = "https://accounts.google.com/o/oauth2/v2/auth";
        const googleClientId = "Add this in .env file";
        const redirectUri = "Add this in .env file";
        const scope = "openid email profile";

        window.location.href = `${googleAuthURL}?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Function to handle Google OAuth callback
    const handleGoogleCallback = async (code) => {
        const UserId = localStorage.getItem("userId"); // Retrieve userId from storage or state

        if (!zuraId) {
            setMessage("ID is missing. Please log in again.");
            return;
        }

        try {
<<<<<<< HEAD
            const response = await fetch("Connect google api link", {
=======
            const response = await fetch("https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/connect-google", {
>>>>>>> eebf0f742264dd5088afe78c8256d57111096384
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, UserId }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Google account connected successfully!");
                console.log("Google connection response:", data);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error connecting Google account:", error);
            setMessage("An error occurred while connecting your Google account.");
        }
    };

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            {isAuthenticated ? (
                <>
                    {userProfile ? (
                        <div>
                            <h2>Welcome, {userProfile.name}!</h2>
                            <p>Email: {userProfile.email}</p>
                            <p>Username: {userProfile.username}</p>
                        </div>
                    ) : (
                        <p>Loading profile...</p>
                    )}
                    <button onClick={handleConnectWithGoogle}>Connect with Google</button>
                    <p>{message}</p>
                </>
            ) : (
                <p>Please log in to view your profile and connect your Google account.</p>
            )}
        </div>
    );
}

export default HomePage;
