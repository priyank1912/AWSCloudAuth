import React, { useState, useEffect } from "react";

function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmationCode: "",
    });
    const [googleUsername, setGoogleUsername] = useState(""); // Preferred username for Google
    const [twitterUsername, setTwitterUsername] = useState(""); // Preferred username for Twitter
    const [message, setMessage] = useState("");
    const [isConfirmationStep, setIsConfirmationStep] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                setMessage(data.message);
                setIsConfirmationStep(true);
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

    // Handle Signup with Google
    const handleGoogleSignup = async () => {
        if (!googleUsername) {
            setMessage("Please enter a preferred username for Google signup.");
            return;
        }

        console.log("Initiating Google signup for username:", googleUsername);

        const googleSignupURL = "https://accounts.google.com/o/oauth2/v2/auth";
        const clientId = "543378407550-st4cmipset8ocjingv3h037dlsmbfg3c.apps.googleusercontent.com";
        const redirectUri = "https://abhisheksagar.xyz/homepage";
        const scope = "openid email profile";

        sessionStorage.setItem("googleUsername", googleUsername);
        window.location.href = `${googleSignupURL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Handle Signup with Twitter
    const handleTwitterSignup = async () => {
        if (!twitterUsername) {
            setMessage("Please enter a preferred username for Twitter signup.");
            return;
        }

        console.log("Initiating Twitter signup for username:", twitterUsername);

        try {
            // Fetch the Twitter OAuth request token from backend
            const response = await fetch(
                "https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/twitter-request-token",
                { method: "POST" }
            );
            const data = await response.json();
            console.log("Twitter Request Token:", data);

            if (response.ok) {
                const { oauth_token } = data;
                sessionStorage.setItem("twitterUsername", twitterUsername);
                // Redirect to Twitter authorization URL
                window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error initiating Twitter signup:", error);
            setMessage(`Error: ${error.message}`);
        }
    };

    // Handle OAuth Callbacks for Google and Twitter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code"); // For Google
        const oauthToken = urlParams.get("oauth_token"); // For Twitter
        const oauthVerifier = urlParams.get("oauth_verifier"); // For Twitter

        const googleUsername = sessionStorage.getItem("googleUsername");
        const twitterUsername = sessionStorage.getItem("twitterUsername");

        if (code && googleUsername) {
            completeOAuthSignup("google", { code, username: googleUsername });
        } else if (oauthToken && oauthVerifier && twitterUsername) {
            completeOAuthSignup("twitter", { oauthToken, oauthVerifier, username: twitterUsername });
        }
    }, []);

    const completeOAuthSignup = async (provider, payload) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/${provider}-signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            console.log(`${provider} signup API response:`, data);

            if (response.ok) {
                setMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup successful!`);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(`Error during ${provider} signup:`, error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            {!isConfirmationStep ? (
                <div>
                    {/* Manual Signup */}
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
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Signing Up..." : "Signup"}
                        </button>
                    </form>

                    <hr />
                    {/* Google Signup */}
                    <input
                        type="text"
                        placeholder="Preferred Username for Google Signup"
                        value={googleUsername}
                        onChange={(e) => setGoogleUsername(e.target.value)}
                    />
                    <button onClick={handleGoogleSignup} disabled={isLoading}>
                        {isLoading ? "Redirecting..." : "Signup with Google"}
                    </button>

                    <hr />
                    {/* Twitter Signup */}
                    <input
                        type="text"
                        placeholder="Preferred Username for Twitter Signup"
                        value={twitterUsername}
                        onChange={(e) => setTwitterUsername(e.target.value)}
                    />
                    <button onClick={handleTwitterSignup} disabled={isLoading}>
                        {isLoading ? "Redirecting..." : "Signup with Twitter"}
                    </button>
                </div>
            ) : (
                <form>
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
