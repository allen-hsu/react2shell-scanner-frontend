# React2Shell Scanner - Frontend

Web UI for detecting CVE-2025-55182 & CVE-2025-66478 vulnerabilities in Next.js applications.

## Scanner Source

This tool is based on the open-source scanner from Assetnote:

- **Repository**: https://github.com/assetnote/react2shell-scanner
- **Research**: Assetnote Security Research Team

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Features

- Single host vulnerability scanning
- Multiple scan modes (RCE PoC, Safe Check, Vercel Bypass)
- Custom path testing
- WAF bypass options
- Windows/Linux target support
