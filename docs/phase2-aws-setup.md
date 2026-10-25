# Phase 2 AWS Setup (one time)

Phase 2 adds free account sign-up and member profiles. It needs four one-time changes
in AWS. Do them **before** merging the Phase 2 pull request, then merge right away.

| Step | Where | Time |
|------|-------|------|
| 1. Turn on self-service sign-up | Cognito console | 1 min |
| 2. Run the setup script | CloudShell | 5 min |
| 3. Merge the PR | GitHub | 1 min |
| 4. Check the deployment | Amplify console | 5–10 min |

Nothing here changes existing members' logins.

---

## 1. Turn on self-service sign-up (Cognito console)

Use the console for this. The command-line equivalent resets other user pool settings.

1. Open the AWS console with the region set to **US East (N. Virginia)**.
2. Go to **Cognito → User pools → `seniorcybersecure-prod`** (ID `us-east-1_If1TM2kBR`).
3. Open the **Sign-up** tab.
4. Under **Self-service sign-up**, click **Edit**, turn on **Enable self-registration**, and click **Save changes**.
5. On the same tab, confirm **Attribute verification and user account confirmation** has
   "Send email message, verify email address" turned on. It was set up this way originally.

> **Email limit:** Cognito's built-in email sender allows about 50 emails a day. That's
> plenty to start. Before promoting the site, switch to Amazon SES (Part 3 of
> `docs/aws-setup-guide.md`) so codes come from your own domain without that limit.

## 2. Run the setup script (CloudShell)

Open CloudShell (the **>_** icon in the top bar, region **US East (N. Virginia)**), paste
the whole block, and press Enter. It is safe to run more than once.

It does four things:
- creates an **identity pool** linked to your existing user pool,
- creates the two IAM roles the identity pool needs (signed-in and guest; guest access
  stays turned off),
- stores their IDs as **environment variables** on the Amplify app, where the backend reads them,
- **bootstraps** the account for AWS CDK, which Amplify uses to deploy the backend
  (a one-time, account-wide setup).

```bash
REGION=us-east-1
APP_ID=d23vdyixhlcmzr
POOL_ID=us-east-1_If1TM2kBR
CLIENT_ID=353vsdvae15qlk8mb6c346rm64
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
NAME=seniorcybersecure

# --- Identity pool (reuse if it already exists) ---
IDP_ID=$(aws cognito-identity list-identity-pools --region $REGION --max-results 60 \
  --query "IdentityPools[?IdentityPoolName=='${NAME}_identity'].IdentityPoolId | [0]" --output text)
if [ "$IDP_ID" = "None" ] || [ -z "$IDP_ID" ]; then
  IDP_ID=$(aws cognito-identity create-identity-pool --region $REGION \
    --identity-pool-name "${NAME}_identity" --no-allow-unauthenticated-identities \
    --cognito-identity-providers ProviderName=cognito-idp.${REGION}.amazonaws.com/${POOL_ID},ClientId=${CLIENT_ID},ServerSideTokenCheck=false \
    --query IdentityPoolId --output text)
  echo "Created identity pool $IDP_ID"
else
  echo "Using existing identity pool $IDP_ID"
fi

# --- IAM roles for signed-in and guest identities ---
make_role () {   # $1 = role name, $2 = authenticated|unauthenticated
  cat > trust-$2.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "cognito-identity.amazonaws.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "cognito-identity.amazonaws.com:aud": "${IDP_ID}" },
      "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "$2" }
    }
  }]
}
EOF
  if aws iam get-role --role-name "$1" >/dev/null 2>&1; then
    aws iam update-assume-role-policy --role-name "$1" --policy-document file://trust-$2.json
  else
    aws iam create-role --role-name "$1" --assume-role-policy-document file://trust-$2.json >/dev/null
  fi
  aws iam get-role --role-name "$1" --query Role.Arn --output text
}
AUTH_ROLE_ARN=$(make_role amplify-${NAME}-authRole authenticated)
UNAUTH_ROLE_ARN=$(make_role amplify-${NAME}-unauthRole unauthenticated)
sleep 10   # let IAM register the new roles
aws cognito-identity set-identity-pool-roles --region $REGION --identity-pool-id "$IDP_ID" \
  --roles authenticated=$AUTH_ROLE_ARN,unauthenticated=$UNAUTH_ROLE_ARN

# --- Tell the Amplify backend where these are ---
aws amplify update-app --region $REGION --app-id $APP_ID \
  --environment-variables AUTH_IDENTITY_POOL_ID=$IDP_ID,AUTH_AUTHENTICATED_ROLE_ARN=$AUTH_ROLE_ARN,AUTH_UNAUTHENTICATED_ROLE_ARN=$UNAUTH_ROLE_ARN \
  --query "app.environmentVariables" --output json

# --- One-time CDK bootstrap for this account and region (takes 2-3 minutes) ---
npx --yes aws-cdk@2 bootstrap aws://$ACCOUNT/$REGION

echo ""
echo "=== Phase 2 setup complete ==="
echo "Identity pool:   $IDP_ID"
echo "Signed-in role:  $AUTH_ROLE_ARN"
echo "Guest role:      $UNAUTH_ROLE_ARN"
echo "Service role on app: $(aws amplify get-app --region $REGION --app-id $APP_ID --query app.iamServiceRoleArn --output text)"
```

The last line should show `AmplifyServiceRole-SeniorCyberSecure`, the role created
while fixing the October deploy. Deploying a backend requires it.

## 3. Merge the pull request

Merge the vulnerability-fix PR (#13) first if it isn't merged yet, then the Phase 2 PR.

Then update the build settings saved in the Amplify console so they match the repo's
`amplify.yml`. A stale copy there caused the October deploy failure. In CloudShell:

```bash
curl -fsSL https://raw.githubusercontent.com/rlmaxon/cyberscam/main/amplify.yml -o amplify.yml && \
aws amplify update-app --region us-east-1 --app-id d23vdyixhlcmzr --build-spec file://amplify.yml --query app.appId --output text
```

## 4. Check the deployment

In the Amplify console (**cyberscam → main**), the build now has a **Backend** step.
The first one takes about 5–10 minutes because it creates the member-data database and API.
Later builds are faster.

When it's green:
1. Open the site, click **Sign In / Join**, then **Create a Free Account**, and sign up
   with a personal email address.
2. Enter the 6-digit code from the email. You should land on the **Welcome** step.
3. Fill it in. The dashboard should greet you by name.
4. Open **My Profile & Alerts**, change something, and save.

### If the build fails

- **"Missing environment variable AUTH_IDENTITY_POOL_ID"**: step 2 didn't finish. Run it again.
- **"Has the environment been bootstrapped?"**: the CDK bootstrap at the end of step 2 didn't finish. Run just that line again.
- **"Unable to assume specified IAM Role"**: the app lost its service role. In CloudShell:
  `aws amplify update-app --region us-east-1 --app-id d23vdyixhlcmzr --iam-service-role-arn $(aws iam get-role --role-name AmplifyServiceRole-SeniorCyberSecure --query Role.Arn --output text)`
- Anything else: copy the last 40 lines of the **Backend** step log.

### Undo

To go back, revert the PR in GitHub. The site returns to sign-in only (existing members
are unaffected). The identity pool and roles can stay. They cost nothing when unused.
