import {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: "ap-south-1" });

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

        // Check if the trigger source is `DefineAuthChallenge`
        if (event.triggerSource === "DefineAuthChallenge_Authentication") {
            console.log("Handling DefineAuthChallenge trigger...");

            // Define the next challenge or issue tokens based on session status
            if (!event.request.session || event.request.session.length === 0) {
                // First authentication attempt: issue CUSTOM_CHALLENGE
                console.log("Issuing CUSTOM_CHALLENGE...");
                event.response = {
                    challengeName: "CUSTOM_CHALLENGE",
                    issueTokens: false,
                    failAuthentication: false,
                };
            } else {
                // Check the session state
                const lastChallenge = event.request.session.slice(-1)[0];
                console.log("Last challenge:", lastChallenge);

                if (lastChallenge.challengeResult) {
                    // If the last challenge was successful, issue tokens
                    console.log("Last challenge succeeded. Issuing tokens...");
                    event.response = {
                        challengeName: null,
                        issueTokens: true,
                        failAuthentication: false,
                    };
                } else {
                    // If the last challenge failed, fail authentication
                    console.log("Last challenge failed. Failing authentication...");
                    event.response = {
                        challengeName: null,
                        issueTokens: false,
                        failAuthentication: true,
                    };
                }
            }

            console.log("Response for DefineAuthChallenge:", JSON.stringify(event.response, null, 2));
            return event;
        }

        // If not the expected triggerSource, log and exit
        console.error("Unexpected trigger source:", event.triggerSource);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Unsupported trigger source." }),
        };
    } catch (error) {
        console.error("Error during DefineAuthChallenge:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

