import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" });

export const handler = async (event) => {
  try {
    console.log("Received event:", event);

    const { code, username } = JSON.parse(event.body);
    console.log("Parsed input:", { code, username });

    if (!username) {
      throw new Error("Username is required.");
    }

    // Step 1: Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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

    const tokenData = await tokenResponse.json();
    console.log("Token Response:", tokenData);

    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange tokens: ${tokenData.error}`);
    }

    const { id_token } = tokenData;
    const decodedToken = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
    console.log("Decoded Token:", decodedToken);

    const { email, given_name } = decodedToken;

    // Step 2: Check if the email is already registered
    const listUsersByEmailCommand = new ListUsersCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Filter: `email = "${email}"`,
    });

    const emailSearchResponse = await cognitoClient.send(listUsersByEmailCommand);
    if (emailSearchResponse.Users && emailSearchResponse.Users.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    // Step 3: Check if the username is already taken
    const listUsersByUsernameCommand = new ListUsersCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Filter: `username = "${username}"`,
    });

    const usernameSearchResponse = await cognitoClient.send(listUsersByUsernameCommand);
    if (usernameSearchResponse.Users && usernameSearchResponse.Users.length > 0) {
      throw new Error("Username already exists. Please choose another.");
    }

    // Step 4: Create the user in Cognito
    const createUserParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: username, // Use the preferred username directly
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "given_name", Value: given_name || username },
      ],
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    await cognitoClient.send(createUserCommand);
    console.log("User successfully created in Cognito.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User successfully created in Cognito!",
      }),
    };
  } catch (error) {
    console.error("Error during Google sign-up:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
