# GWS CLI Setup

GWS CLI v0.22.5 installed via npm:

```bash
npm install -g @googleworkspace/cli
```

## Authentication Setup (Manual OAuth)

Since `gws auth setup` requires the gcloud CLI, use the manual path below.

### Step 1: Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Note your **Project ID**

### Step 2: Enable required APIs

In the Cloud Console, enable these APIs for your project:

- Google Drive API
- Gmail API
- Google Calendar API
- Admin SDK API

Navigate to **APIs & Services → Library** and search for each one.

### Step 3: Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Set User Type to **External**
3. Fill in App name, support email, developer email
4. Add your Google account as a **Test user**
5. Save

### Step 4: Create OAuth client credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Desktop app**
4. Download the JSON file

### Step 5: Place credentials and log in

```bash
mkdir -p ~/.config/gws
cp /path/to/downloaded-credentials.json ~/.config/gws/client_secret.json

gws auth login --services drive,gmail,calendar,admin
```

The command will print a URL — open it in your browser, complete the OAuth flow, then paste the authorization code back into the terminal.

### Step 6: Verify

```bash
gws auth status
gws drive files list --params '{"pageSize": 5}'
```

`gws auth status` should show `auth_method: oauth` and `client_config_exists: true`.
