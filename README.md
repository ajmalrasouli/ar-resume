# Ajmal Rasouli - Cloud & DevOps Engineer

[![Website](https://img.shields.io/badge/Visit-My%20Resume-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://lemon-desert-05dc5301e.6.azurestaticapps.net)
[![Visitor Count](https://badge.tcblabs.net/api/hc/arasouli/index)](https://lemon-desert-05dc5301e.6.azurestaticapps.net)
[![Azure Static Web Apps CI/CD](https://github.com/ajmalrasouli/ar-resume/actions/workflows/azure-static-web-apps-ambitious-island-0ade2b403.yml/badge.svg)](https://github.com/ajmalrasouli/ar-resume/actions)

## About This Project

This is my personal resume website built with React and hosted on Azure Static Web Apps. The site features a clean, responsive design and integrates with Azure Functions for backend services.

🔗 **Live Demo**: [lemon-desert-05dc5301e.6.azurestaticapps.net](https://lemon-desert-05dc5301e.6.azurestaticapps.net)

## 🚀 Features

- **Modern React Frontend**: 
  - Built with functional components and React hooks
  - Interactive UI with real-time feedback
  - Smooth navigation with React Router
- **Azure Integration**:
  - Hosted on Azure Static Web Apps
  - Serverless backend with Azure Functions
  - Visitor counter using Cosmos DB
- **Responsive Design**: Works on all device sizes
- **AI-Powered Features**:
  - **AI Chatbot**: Interactive assistant that answers questions about my experience and skills
  - **Text Generation**: Generate text using OpenAI's GPT-4
  - **Image Generation**: Create images from text prompts using Stability AI
  - **Rate Limiting**: API protection with Azure Table Storage
  - **Fallback Responses**: Graceful degradation when services are unavailable

## 🛠️ Tech Stack

- **Frontend**: 
  - React.js
  - Bootstrap 5
  - React Icons
  
- **Backend**:
  - Azure Functions (Node.js)
  - Cosmos DB (for visitor counter)
  - Azure Table Storage (for rate limiting)
  - OpenAI API Integration
  - Stability AI API Integration
  - Comprehensive error handling and logging
  
- **DevOps**:
  - GitHub Actions for CI/CD
  - Azure Static Web Apps for hosting

## 🖼️ AI Image Generator

The AI Image Generator allows you to create images from text descriptions using Stability AI's Stable Diffusion model.

### Features
- Generate high-quality images from text prompts
- Supports various image dimensions
- Real-time generation status
- Download generated images

### How to Use
1. Navigate to the "AI Projects" section
2. Enter your image description in the text area
3. Click "Generate Image"
4. Wait for the image to generate
5. Download the image using the download button

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Azure CLI (for local development)
- Azure Functions Core Tools

### 🔧 Environment Setup

1. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_STABILITY_API_KEY=your_stability_ai_key_here
   ```

2. For local development, create a `local.settings.json` in the `/api` directory:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "STABILITY_API_KEY": "your_stability_ai_key_here"
     },
     "ConnectionStrings": {}
   }
   ```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ajmalrasouli/ar-resume.git
   cd ar-resume
   ```

2. Install dependencies:
   ```bash
   npm install
   cd api
   npm install
   cd ..
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. In a separate terminal, start the Azure Functions locally:
   ```bash
   cd api
   func start
   ```

## 📦 Deployment

The application is automatically deployed to Azure Static Web Apps on push to the `main` branch.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
