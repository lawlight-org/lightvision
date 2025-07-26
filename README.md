# LightVision

**Most lightweight and easy to use CMS.**  
Make any text or image editable just by adding one attribute.  
Built with [Bun](https://bun.sh/) and [React](https://react.dev/).

---

## Server Setup

```bash
git clone https://github.com/lawlight-org/lightvision
cd lightvision/server

bun install
cp config.default.json config.json
```

Edit `config.json`:

```json
{
  "server_port": 1337,
  "website_path": "/path/to/your/static/site",
  "admin_email": "you@example.com"
}
```

Create a `.env` file in your website root with:

```env
VITE_APP_BASE_URL="http://localhost:1337/"
VITE_APP_GOOGLE_OAUTH_CLIENT_ID="your-client-id"
```

Run the server:

```bash
bun run index.ts
```

---

## Website Setup

Install the package:

```bash
npm i lightvision
```

Use the login component:

```js
import { AdminLogin } from "lightvision";

<AdminLogin />;
```

Wrap your app with the provider:

```js
import { LightVisionProvider } from "lightvision";

<LightVisionProvider clientId={import.meta.env.VITE_APP_GOOGLE_OAUTH_CLIENT_ID}>
  <App />
</LightVisionProvider>;
```

---

## File Structure

Your public folder should look like:

```
public/
├── assets/
│   ├── img/
│   └── vid/
└── content.json
```

---

## Make Elements Editable

Add `data-lv="$yourKey"` to any element you want to be editable.

```html
<img src="assets/img/lawlight.png" data-lv="$myimage" />
```

Then map the keys in `content.json`:

```json
{
  "$myimage": "assets/img/lawlight.png"
}
```
