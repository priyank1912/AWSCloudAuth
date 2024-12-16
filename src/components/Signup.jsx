import React, { useState, useEffect } from "react";

function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmationCode: "",
    });
    const [googleUsername, setGoogleUsername] = useState(""); // Preferred username for Google
    const [message, setMessage] = useState("");
    const [isConfirmationStep, setIsConfirmationStep] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For loading state during API calls

    // Handle manual signup
    const handleSignup = async () => {
        console.log("Starting manual signup with data:", formData);
        setIsLoading(true);
        try {
            const response = await fetch("https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                }),
            });

            const data = await response.json();
            console.log("Signup API response:", data);

            if (response.ok) {
                setMessage(data.message); // Message from Lambda function
                setIsConfirmationStep(true); // Move to confirmation step
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error during manual signup:", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle account confirmation
    const handleConfirmAccount = async () => {
        console.log("Confirming account for username:", formData.username);
        setIsLoading(true);
        try {
            const response = await fetch("https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    confirmationCode: formData.confirmationCode,
                }),
            });

            const data = await response.json();
            console.log("Account confirmation response:", data);

            if (response.ok) {
                setMessage(data.message); // Message from Lambda function
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error during account confirmation:", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Signup with Google
    const handleGoogleSignup = async () => {
        if (!googleUsername) {
            setMessage("Please enter a preferred username for Google signup.");
            return;
        }

        console.log("Initiating Google signup for username:", googleUsername);

        const googleSignupURL = "https://accounts.google.com/o/oauth2/v2/auth";
        const clientId = "543378407550-st4cmipset8ocjingv3h037dlsmbfg3c.apps.googleusercontent.com"; // Replace with your Google Client ID
        const redirectUri = "https://abhisheksagar.xyz/homepage"; // Replace with your redirect URI
        const scope = "openid email profile";

        sessionStorage.setItem("googleUsername", googleUsername);
        window.location.href = `${googleSignupURL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Handle Google Callback (Extract the authorization code)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            const googleUsername = sessionStorage.getItem("googleUsername"); // Retrieve the preferred username from session storage
            console.log("Google callback received. Authorization code:", code);

            // Call the Google signup API
            const completeGoogleSignup = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(
                        "https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/google-signup",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                code,
                                username: googleUsername, // Pass the preferred username
                            }),
                        }
                    );

                    const data = await response.json();
                    console.log("Google signup API response:", data);

                    if (response.ok) {
                        setMessage(data.message); // Show success message
                    } else {
                        setMessage(`Error: ${data.error}`);
                    }
                } catch (error) {
                    console.error("Error during Google signup:", error);
                    setMessage(`Error: ${error.message}`);
                } finally {
                    setIsLoading(false);
                }
            };

            completeGoogleSignup();
        } else {
            console.log("No authorization code found in URL.");
        }
    }, []);

    return (
        <div>
            <h2>Signup</h2>
            {!isConfirmationStep ? (
                <div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSignup();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Signing Up..." : "Signup"}
                        </button>
                    </form>
                    <hr />
                    <input
                        type="text"
                        placeholder="Preferred Username for Google Signup"
                        value={googleUsername}
                        onChange={(e) => setGoogleUsername(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />
                    <button
                        onClick={handleGoogleSignup}
                        style={{ marginTop: "10px" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Redirecting..." : "Signup with Google"}
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleConfirmAccount();
                    }}
                >
                    <input
                        type="text"
                        placeholder="Confirmation Code"
                        value={formData.confirmationCode}
                        onChange={(e) =>
                            setFormData({ ...formData, confirmationCode: e.target.value })
                        }
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Confirming..." : "Confirm Account"}
                    </button>
                </form>
            )}
            <p>{message}</p>
        </div>
    );
}

export default Signup;