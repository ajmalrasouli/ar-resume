# Ajmal Rasouli - Cloud & DevOps Engineer

[![Website](https://img.shields.io/badge/Visit-My%20Resume-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://lemon-desert-05dc5301e.6.azurestaticapps.net)
[![Visitor Count](https://badge.tcblabs.net/api/hc/arasouli/index)](https://lemon-desert-05dc5301e.6.azurestaticapps.net)

## About This Project

This is my personal resume website built with React and hosted on Azure Static Web Apps. The site features a clean, responsive design and integrates with Azure Functions for backend services.

🔗 **Live Demo**: [lemon-desert-05dc5301e.6.azurestaticapps.net](https://lemon-desert-05dc5301e.6.azurestaticapps.net)

## 🚀 Features

- **Modern React Frontend**: Built with functional components and React hooks
- **Azure Integration**:
  - Hosted on Azure Static Web Apps
  - Serverless backend with Azure Functions
  - Visitor counter using Cosmos DB
- **Responsive Design**: Works on all device sizes
- **AI-Powered Text Generation**: Integrated with AI for enhanced interactivity

## 🛠️ Tech Stack

- **Frontend**: 
  - React.js
  - Bootstrap 5
  - React Icons
  
- **Backend**:
  - Azure Functions (Node.js)
  - Cosmos DB (for visitor counter)
  
- **DevOps**:
  - GitHub Actions for CI/CD
  - Azure Static Web Apps for hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Azure CLI (for local development)
- Azure Functions Core Tools

### Local Development

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
