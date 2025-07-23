import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({
        zuraId: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // Navigation hook

    // Handle standard login
    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("standard login api link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
<<<<<<< HEAD
                    zuraId: formData.username,
=======
                    username: formData.zuraId,
>>>>>>> eebf0f742264dd5088afe78c8256d57111096384
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("id_token", data.idToken);
                localStorage.setItem("access_token", data.accessToken);
                sessionStorage.setItem("jwtToken", data.accessToken); // Store the access token
                setMessage("Login successful!");

                // Redirect to homepage
                navigate("/homepage");
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error during login:", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google login redirect
    const handleGoogleLogin = () => {
        console.log("Redirecting to Google for authentication...");
        const googleLoginURL = "https://accounts.google.com/o/oauth2/v2/auth";
        const clientId = "Enter your Google Client ID here";
        const redirectUri = "Enter your redirect URI here";
        const scope = "openid email profile";

        window.location.href = `${googleLoginURL}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    };

    // Handle Google OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            console.log("Google callback received. Authorization code:", code);

            const completeGoogleLogin = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(
                        "Enter your Google login API link here",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code }),
                        }
                    );

                    const data = await response.json();
                    console.log("Google login API response:", data);

                    if (response.ok && data.accessToken) {
                        sessionStorage.setItem("jwtToken", data.accessToken); // Store access token
                        setMessage("Google login successful!");
                        navigate("/homepage"); // Redirect to homepage
                    } else {
                        setMessage(`Error: ${data.error || "Invalid response from server"}`);
                    }
                } catch (error) {
                    console.error("Error during Google login:", error);
                    setMessage(`Error: ${error.message}`);
                  } finally {
                    setIsLoading(false);
                }
            };


            completeGoogleLogin();
        } else {
            console.log("No authorization code found in URL.");
        }
    }, [navigate]);

    return (
        <div>
            <h2>Login</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
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
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
            <hr />
            <button
                onClick={handleGoogleLogin}
                style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#4285F4",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
                disabled={isLoading}
            >
                {isLoading ? "Redirecting..." : "Login with Google"}
            </button>
            <p>{message}</p>
        </div>
    );
}

export default Login;
