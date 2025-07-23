# Authless - Serverless User Authentication System on AWS

A production-ready, fully serverless authentication system leveraging AWS services such as Cognito, API Gateway, Lambda, and DynamoDB. This project handles user registration, login/logout, and OAuth-based social logins (Google, Microsoft), while securely storing user data in DynamoDB.

---

## 🧩 Features

- ✅ User Signup & Login (with email/password)
- 🔐 OAuth Login via Google & Microsoft (Cognito Federated Identities)
- ⚡ Serverless architecture using AWS Lambda
- 🌐 RESTful API exposure via API Gateway
- 🗄️ Secure user data storage using AWS DynamoDB
- 🔐 Role-based access and IAM policies for secure operations
- ☁️ 100% Cloud-native and cost-efficient (free tier eligible)

---

## 🛠️ Technologies Used

| Service         | Role |
|-----------------|------|
| **AWS Cognito** | User Authentication (including social login) |
| **AWS Lambda**  | Backend logic (signup, login, user handling) |
| **API Gateway** | API layer for external access |
| **DynamoDB**    | NoSQL database for user metadata |
| **IAM**         | Role-based access control |

---

## 📐 Architecture Overview

1. **Frontend / Client** calls the API exposed via **API Gateway**.
2. API Gateway triggers the appropriate **Lambda function** (e.g., register, login).
3. Lambda performs logic and interacts with:
   - **Cognito** for authentication operations
   - **DynamoDB** to store/retrieve user profile data
4. OAuth (Google/Microsoft) is configured in Cognito and handled seamlessly via redirects.

---

