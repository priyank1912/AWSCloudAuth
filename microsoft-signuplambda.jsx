import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = "ap-south-1";

// Initialize AWS clients
const cognitoClient = new CognitoIdentityProviderClient({ region });
const dynamoDBClient = new DynamoDBClient({ region });
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

const tableName = process.env.DYNAMODB_TABLE_NAME;

export const handler = async (event) => {
    try {
        console.log("Received event:", event);

        const { code, username } = JSON.parse(event.body);
        console.log("Parsed input:", { code, username });

        if (!username) {
            throw new Error("Username is required.");
        }

        // Step 1: Exchange authorization code for tokens
        const tokenResponse = await fetch(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.MICROSOFT_CLIENT_ID,
                    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
                    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
                    grant_type: "authorization_code",
                }),
            }
        );

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            throw new Error(`Failed to exchange tokens: ${tokenData.error}`);
        }

        const { id_token } = tokenData;
        const decodedToken = JSON.parse(
            Buffer.from(id_token.split(".")[1], "base64").toString()
        );
        const { email, given_name } = decodedToken;

        // Step 2: Check if the email is already registered
        const emailCheck = await cognitoClient.send(
            new ListUsersCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Filter: `email = "${email}"`,
            })
        );

        if (emailCheck.Users?.length) {
            throw new Error("An account with this email already exists.");
        }

        // Step 3: Check if the username is already taken
        const usernameCheck = await cognitoClient.send(
            new ListUsersCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Filter: `username = "${username}"`,
            })
        );

        if (usernameCheck.Users?.length) {
            throw new Error("Username already exists. Please choose another.");
        }

        // Step 4: Create the user in Cognito with actual email and attributes
        await cognitoClient.send(
            new AdminCreateUserCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "given_name", Value: given_name || username },
                    { Name: "email_verified", Value: "true" }, // Mark email as verified
                ],
                MessageAction: "SUPPRESS",
            })
        );

        console.log("User successfully created in Cognito.");

        // Step 5: Set a permanent password for the user
        const defaultPassword = process.env.DEFAULT_PASSWORD || "TempP@ss123!";
        await cognitoClient.send(
            new AdminSetUserPasswordCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                Password: defaultPassword,
                Permanent: true,
            })
        );

        console.log("Permanent password set for user.");

        // Step 6: Add the user to DynamoDB
        const newItem = {
            userId: username,
            email,
            username,
            provider: "Microsoft",
            id_token,
            createdAt: new Date().toISOString(),
        };

        await dynamoDB.send(
            new PutCommand({
                TableName: tableName,
                Item: newItem,
            })
        );

        console.log("User successfully added to DynamoDB:", newItem);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully created in Cognito and added to DynamoDB!",
                user: { username, email },
            }),
        };
    } catch (error) {
        console.error("Error during Microsoft sign-up:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
