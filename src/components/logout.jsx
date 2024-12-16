import React, { useEffect } from "react";

function Logout() {
    useEffect(() => {
        const logout = async () => {
            try {
                // Get the token from session storage
                const token = sessionStorage.getItem("jwtToken");

                if (token) {
                    // Call the logout Lambda function
                    const response = await fetch("https://5u7fue8oo3.execute-api.ap-south-1.amazonaws.com/logout", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ accessToken: token }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log(data.message);
                        sessionStorage.removeItem("jwtToken"); // Clear the token from session storage
                    } else {
                        console.error(`Logout failed: ${data.error}`);
                    }
                } else {
                    console.warn("No token found in session storage.");
                }
            } catch (error) {
                console.error(`Logout error: ${error.message}`);
            }
        };

        logout();
    }, []);

    return <h2>You have been logged out!</h2>;
}

export default Logout;

