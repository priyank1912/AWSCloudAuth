import fetch from "node-fetch";
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" });

export const handler = async (event) => {
    console.log("Received event:", event);

    let body;

    try {
        // Parse the body
        body = event.body ? JSON.parse(event.body) : {};
        console.log("Parsed body:", body);
    } catch (error) {
        console.error("Failed to parse request body:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body" }),
        };
    }

    const { code, email } = body;

    try {
        if (!code || !email) {
            throw new Error("Missing authorization code or email");
        }

        console.log("Google login flow triggered with code and email");

        // Step 1: Exchange authorization code for tokens
        const googleTokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const googleTokenData = await googleTokenResponse.json();
        console.log("Google Token Response:", googleTokenData);

        if (!googleTokenResponse.ok) {
            throw new Error(`Failed to exchange code for tokens: ${googleTokenData.error}`);
        }

        const { id_token } = googleTokenData;

        // Step 2: Decode the Google ID token
        const decodedToken = JSON.parse(
            Buffer.from(id_token.split(".")[1], "base64").toString()
        );
        console.log("Decoded Token:", decodedToken);

        const { email: googleEmail, name } = decodedToken;

        // Step 3: Verify email
        if (googleEmail !== email) {
            throw new Error("Email mismatch during Google login");
        }

        // Step 4: Check if the user exists in Cognito User Pool
        console.log("Checking if user exists in Cognito...");
        const listUsersCommand = new ListUsersCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Filter: `email = "${googleEmail}"`,
        });

        const cognitoResponse = await cognitoClient.send(listUsersCommand);
        console.log("Cognito Response:", cognitoResponse);

        if (!cognitoResponse.Users || cognitoResponse.Users.length === 0) {
            throw new Error("User does not exist in Cognito User Pool");
        }

        // Step 5: Return successful login response
        console.log("Email verified successfully and user exists:", googleEmail);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Google login successful!",
                email: googleEmail,
                name,
            }),
        };
    } catch (error) {
        console.error("Error during Google login:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
