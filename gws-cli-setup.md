# GWS CLI Setup

GWS CLI v0.22.5 installed via npm:

```bash
npm install -g @googleworkspace/cli
```

## Next steps

1. Configure your Google Cloud project:
   ```bash
   gws auth setup
   ```

2. Log in:
   ```bash
   gws auth login
   ```

3. Verify:
   ```bash
   gws drive files list --params '{"pageSize": 5}'
   ```
