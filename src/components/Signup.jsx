import React, { useState, useEffect } from "react";

function Signup() {
    const [formData, setFormData] = useState({
        zuraId: "",
        email: "",
        password: "",
        confirmationCode: "",
    });
    const [message, setMessage] = useState("");
    const [isConfirmationStep, setIsConfirmationStep] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle manual signup
    const handleSignup = async () => {
        console.log("Starting manual signup with data:", formData);
        if (!formData.zuraId) {
            setMessage("Zura ID is required.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch("Enter your signup API link here", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
<<<<<<< HEAD
                    zuraId: formData.username,
=======
                    username: formData.zuraId, // Correctly mapping zuraId to username
>>>>>>> eebf0f742264dd5088afe78c8256d57111096384
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
        console.log("Initiating Google signup for zuraId:", formData.zuraId);

        const googleSignupURL = "https://accounts.google.com/o/oauth2/v2/auth";
        const clientId = "Add this in .env file";
        const redirectUri = "Add this in .env file";
        const scope = "openid email profile";

        sessionStorage.setItem("zuraId", formData.zuraId);
        window.location.href = `${googleSignupURL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Handle Signup with Microsoft
    const handleMicrosoftSignup = async () => {
        console.log("Initiating Microsoft signup");

        const microsoftSignupURL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
        const clientId = "b11c6bad-5239-4f25-8c65-9470e22953c5";
        const redirectUri = "https://abhisheksagar.xyz/homepage";
        const scope = "openid email profile";

        window.location.href = `${microsoftSignupURL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&response_type=code&scope=${encodeURIComponent(scope)}`;
    };

    // Handle OAuth Callbacks for Google and Microsoft
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            const zuraId = sessionStorage.getItem("zuraId");
            if (zuraId) {
                completeOAuthSignup("google", { code, username: zuraId });
            } else {
                completeOAuthSignup("microsoft", { code });
            }
        }
    }, []);

    const completeOAuthSignup = async (provider, payload) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `Enter your API gatway link/${provider}-signup`,
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
                            placeholder="Zura ID"
                            value={formData.zuraId}
                            onChange={(e) => setFormData({ ...formData, zuraId: e.target.value })}
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
                    <button onClick={handleGoogleSignup} disabled={isLoading}>
                        {isLoading ? "Redirecting..." : "Signup with Google"}
                    </button>

                    {/* Microsoft Signup */}
                    <button onClick={handleMicrosoftSignup} disabled={isLoading}>
                        {isLoading ? "Redirecting..." : "Signup with Microsoft"}
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
