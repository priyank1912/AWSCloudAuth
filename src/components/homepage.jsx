import React, { useEffect, useState } from "react";

function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Check user authentication
        setIsAuthenticated(checkAuthentication());

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
        const googleClientId = "543378407550-st4cmipset8ocjingv3h037dlsmbfg3c.apps.googleusercontent.com";
        const redirectUri = "https://abhisheksagar.xyz/homepage";
        const scope = "openid email profile";

        window.location.href = `${googleAuthURL}?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Function to handle Google OAuth callback
    const handleGoogleCallback = async (code) => {
        const userId = localStorage.getItem("userId"); // Retrieve userId from storage or state

        if (!userId) {
            setMessage("User ID is missing. Please log in again.");
            return;
        }

        try {
            const response = await fetch("https://https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/connect-google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, userId }),
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
            <p>This is the landing page after a successful login.</p>

            {isAuthenticated ? (
                <>
                    <button onClick={handleConnectWithGoogle}>Connect with Google</button>
                    <p>{message}</p>
                </>
            ) : (
                <p>Please log in to connect your Google account.</p>
            )}
        </div>
    );
}

export default HomePage;
