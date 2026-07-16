# Google Maps Scraper 🗺️

Extract business **Name, Phone, Email, Website** and **Address** from Google Maps for **any niche and any city** — via a beautiful web UI or the command line.

---

## Features

| Feature | Detail |
|---|---|
| **Any niche** | Dentists, lawyers, restaurants, gyms — any search term works |
| **Any location** | Mumbai, New York, London, Tokyo — any city or area |
| **Email discovery** | Visits each business website to find email addresses |
| **Live UI** | Real-time progress bar and scrolling results table |
| **Exports** | Download as CSV, JSON, or styled Excel |
| **CLI** | Fully scriptable from the terminal |

---

## Project Structure

```
startup/
├── scraper/
│   ├── __init__.py          # Package exports
│   ├── maps_scraper.py      # Core Playwright scraper
│   ├── email_finder.py      # Email discovery by visiting websites
│   └── exporters.py         # CSV / JSON / Excel writers
├── static/
│   ├── style.css            # Dark glassmorphism UI
│   └── app.js               # Frontend polling & table rendering
├── templates/
│   └── index.html           # Main SPA page
├── exports/                 # Auto-created — downloaded files land here
├── results/                 # Auto-created — CLI output files land here
├── app.py                   # Flask web server
├── main.py                  # CLI entry point
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Install Python dependencies

```powershell
pip install -r requirements.txt
```

### 2. Install Playwright browsers

```powershell
playwright install chromium
```

> **One-time step only.** Downloads ~130 MB of Chromium.

---

## Using the Web UI

```powershell
python app.py
```

Open **http://localhost:5000** in your browser.

### Steps:
1. Enter a **Search Niche** (e.g. `dentists`)
2. Enter a **Location** (e.g. `Mumbai`)
3. Set **Max Results** with the slider
4. Toggle **Find Emails** on/off
5. Click **⚡ Start Scraping**
6. Watch records appear live in the table
7. Click **CSV / JSON / Excel** to download when done

---

## Using the CLI

```powershell
# Basic usage
python main.py --query "dentists" --location "Mumbai" --max 50

# Export as Excel
python main.py --query "lawyers" --location "Delhi" --max 100 --format excel

# Skip email discovery (faster)
python main.py --query "pizza restaurants" --location "New York" --max 200 --no-emails

# Show browser window (for debugging)
python main.py --query "gyms" --location "Bangalore" --max 30 --visible

# Custom output path
python main.py --query "hotels" --location "Goa" --max 50 --out my_exports/hotels_goa
```

### CLI Arguments

| Argument | Default | Description |
|---|---|---|
| `--query` | **required** | Search niche |
| `--location` | `""` | City or area |
| `--max` | `50` | Max results |
| `--format` | `csv` | `csv` / `json` / `excel` |
| `--emails` | on | Enable email discovery |
| `--no-emails` | — | Skip email discovery |
| `--visible` | off | Show browser window |
| `--out` | `results/<name>` | Custom output file path |

---

## Output Fields

| Column | Description |
|---|---|
| **Name** | Business name |
| **Phone** | Phone number (from Google Maps) |
| **Email** | Email address (discovered by visiting the website) |
| **Website** | Business website URL |
| **Address** | Full street address |
| **Scraped At** | Timestamp |

---

## How It Works

### Phase 1 — Google Maps Scraping
1. Playwright launches a headless Chromium browser.
2. Opens `google.com/maps/search/` with your query + location.
3. Scrolls the sidebar to load more results.
4. Clicks each listing to open the detail panel.
5. Extracts: **Name, Phone, Website, Address** using multiple CSS selector fallbacks.

### Phase 2 — Email Discovery
1. For each business with a website URL, makes an HTTP GET request.
2. Scans the page HTML for `mailto:` links (highest confidence).
3. Falls back to a regex scan of the entire page source.
4. If no email on the homepage, checks `/contact`, `/about`, `/contact-us` sub-pages.

---

## Notes & Tips

- **Email accuracy**: Not all businesses publish emails publicly. Expect ~30–60% hit rate depending on niche.
- **Speed**: With emails enabled, ~2–4 seconds per business. Use `--no-emails` for ~1–2x speed.
- **Google Maps changes**: If scraping breaks, Google likely updated their HTML structure. The scraper uses multiple selector fallbacks to handle this, but very major redesigns may require selector updates in `maps_scraper.py`.
- **Respectful scraping**: The default delay between requests is intentionally modest. Do not remove delays or run concurrent instances against the same IP.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `playwright install` not found | Run `pip install playwright` first |
| Browser not found | Run `playwright install chromium` |
| 0 results returned | Try `--visible` to see what the browser sees; Google may show a CAPTCHA |
| No emails found | Many businesses don't list emails publicly — this is expected |
| `ModuleNotFoundError` | Ensure you're running from the project root directory |

---

## License

MIT — free to use and modify.
