# RINVO - Smart Online PDF Tools

Welcome to RINVO, a comprehensive online PDF tools website that provides free, fast, and secure PDF processing services.

## Features

- **PDF to Word Converter**: Convert PDF files to editable Word documents
- **Word to PDF Converter**: Convert Word documents to PDF format
- **PDF Compressor**: Reduce PDF file size without quality loss
- **PDF Merger**: Combine multiple PDF files into one
- **PDF Splitter**: Split PDF files into multiple documents
- **Image to PDF Converter**: Convert images to PDF format

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Styling**: Tailwind CSS
- **Animations**: GSAP, Lottie
- **Component Library**: React (via CDN)

## Firebase Hosting Setup

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Firebase CLI tools:
   ```bash
   npm install -g firebase-tools
   ```

### Deployment Steps

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Navigate to your project directory:
   ```bash
   cd c:\Users\Admin\OneDrive\Pictures\Desktop\Rinvo
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init hosting
   ```

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Alternative: Deploy using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (portfolio-5aafe)
3. Go to Hosting section
4. Install Firebase CLI if not already installed
5. Run the deployment command from your project directory:
   ```bash
   firebase deploy --project portfolio-5aafe
   ```

## Project Structure

```
rinvo-project/
├── index.html
├── about.html
├── privacy.html
├── contact.html
├── terms.html
├── tools/
│   ├── index.html
│   ├── pdf-to-word.html
│   ├── word-to-pdf.html
│   ├── compress-pdf.html
│   ├── merge-pdf.html
│   ├── split-pdf.html
│   └── image-to-pdf.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── icons/
│   ├── images/
│   └── lottie/
├── firebase.json
├── README.md
├── robots.txt
└── sitemap.xml
```

## SEO Features

- Comprehensive meta tags
- Open Graph and Twitter Card support
- Sitemap.xml for search engine crawling
- robots.txt for search engine guidance

## Ads Integration

The site is prepared for Google AdSense integration with designated ad placeholders throughout the pages.

## Contributing

Feel free to fork this repository and submit pull requests for improvements.

## License

This project is open source and available under the MIT License.