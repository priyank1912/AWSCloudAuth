import {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    AdminUpdateUserAttributesCommand,
    AdminInitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" });
const dynamoDBClient = new DynamoDBClient({ region: "ap-south-1" });
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

const tableName = process.env.DYNAMODB_TABLE_NAME;

export const handler = async (event) => {
    try {
        const { username, confirmationCode, password } = JSON.parse(event.body);

        if (!username || !confirmationCode) {
            throw new Error("Username and confirmation code are required.");
        }

        // Step 1: Confirm user signup with OTP
        const confirmParams = {
            ClientId: process.env.CLIENT_ID,
            Username: username,
            ConfirmationCode: confirmationCode,
        };

        const confirmCommand = new ConfirmSignUpCommand(confirmParams);
        await cognitoClient.send(confirmCommand);
        console.log(`User ${username} confirmed successfully.`);

        // Step 2: Mark email as verified
        const verifyEmailParams = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            UserAttributes: [
                { Name: "email_verified", Value: "true" },
            ],
        };

        const updateUserCommand = new AdminUpdateUserAttributesCommand(verifyEmailParams);
        await cognitoClient.send(updateUserCommand);
        console.log(`Email for user ${username} marked as verified.`);

        // Step 3: Authenticate the user to retrieve id_token (optional)
        if (password) {
            const authParams = {
                AuthFlow: "ADMIN_NO_SRP_AUTH",
                ClientId: process.env.CLIENT_ID,
                UserPoolId: process.env.USER_POOL_ID,
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                },
            };

            const authCommand = new AdminInitiateAuthCommand(authParams);
            const authResponse = await cognitoClient.send(authCommand);

            const idToken = authResponse.AuthenticationResult.IdToken;
            console.log("Retrieved id_token:", idToken);

            // Step 4: Update id_token in DynamoDB
            const updateParams = {
                TableName: tableName,
                Key: { userId: username },
                UpdateExpression: "set id_token = :idToken",
                ExpressionAttributeValues: {
                    ":idToken": idToken,
                },
            };

            await dynamoDB.send(new UpdateCommand(updateParams));
            console.log("id_token added to DynamoDB for user:", username);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "User confirmed, email verified, and authenticated successfully.",
                    id_token: idToken,
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User confirmed and email verified successfully.",
            }),
        };
    } catch (error) {
        console.error("Error confirming account:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
