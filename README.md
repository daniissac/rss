# Feedwave

A minimal, mobile-first RSS feed reader Progressive Web App hosted at [daniissac.com/rss](https://daniissac.com/rss).

## Features

- Add and manage RSS feeds
- Mobile-first responsive design
- Works offline (PWA)
- Clean and modern UI
- Stores feeds in localStorage
- No backend required

## Setup

1. Clone this repository
2. Host it on GitHub Pages:
   - Go to your repository settings
   - Under "GitHub Pages", select your main branch
   - Save the settings

The app will be available at `https://[your-username].github.io/[repository-name]`

## Usage

1. Click the "+" button to add a new RSS feed
2. Enter the RSS feed URL
3. Click "Add" to save the feed
4. Click on any feed in the sidebar to view its articles
5. Click "Read more" on any article to open it in a new tab

## Development

To run locally:

1. Clone the repository
2. Serve the files using any static file server
   - Using Python: `python -m http.server 8000`
   - Using Node.js: `npx serve`
3. Open `http://localhost:8000` in your browser

## Technical Details

- Built with vanilla JavaScript (no frameworks)
- Uses the RSS2JSON API to fetch and parse RSS feeds
- Implements the PWA standard for offline capability
- Stores data in localStorage for persistence
- Mobile-first CSS using modern flexbox layouts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
