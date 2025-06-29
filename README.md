# ThinkTactAI

<p align="center">
  <img src="src/assets/images/logo.png" alt="ThinkTactAI Logo" width="120" />
</p>

##  Live Application

**Try ThinkTactAI now:** [https://thinktact-react-main.vercel.app](https://thinktact-react-main.vercel.app)

## AI-Powered Argument Analysis

ThinkTactAI is a web application that harnesses the power of AI to analyze arguments, identify logical structures, and uncover hidden assumptions. It helps users understand the strength of arguments by breaking them down into their component parts and highlighting any logical flaws.

## Features

- **Argument Analysis**: Input any argument and receive a comprehensive breakdown
- **Premise Identification**: Automatically detects explicit and implicit premises
- **Logical Flaw Detection**: Identifies common logical fallacies and weaknesses
- **Assumption Uncovering**: Reveals hidden assumptions that underpin arguments
- **Improved Versions**: Suggests ways to strengthen your arguments
- **Visual Representation**: See the logical structure of arguments in an intuitive format
- **Security-First**: Built with XSS protection, input validation, and rate limiting

## Technology Stack

- **Frontend**: React 19, Tailwind CSS, Vite
- **AI**: Mistral AI API
- **Security**: DOMPurify, Input Validation, Rate Limiting
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gabrielle01567/thinktact-react-main.git
   cd thinktact-react-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Mistral API key:
   ```
   VITE_MISTRAL_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Deployment

This project is set up for automatic deployment on Vercel. When changes are pushed to the main branch, Vercel will automatically deploy them.

### Quick Deploy

```bash
# Use the automated deployment script
./push-to-github.sh
```

### Manual Deployment

1. Build and push changes:
   ```bash
   npm run build
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Vercel automatically deploys when changes are pushed to GitHub.

## Security Features

- **XSS Protection**: HTML sanitization with DOMPurify
- **Input Validation**: Comprehensive validation and sanitization
- **Rate Limiting**: API call rate limiting to prevent abuse
- **Security Headers**: CSP, X-Frame-Options, and other security headers
- **Error Handling**: Secure error messages without information disclosure

## Usage

1. Navigate to the [Analyzer page](https://thinktact-react-main.vercel.app/analyzer)
2. Enter your argument in the text area
3. Click "Analyze"
4. View the detailed breakdown of your argument
5. Explore the dashboard to understand the logical structure

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Analyzer
![Analyzer](screenshots/analyzer.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Mistral AI for providing the API
- Tailwind CSS for the styling framework
- The React community for the amazing tools and libraries
