import React, { useState } from "react";
import './css/styles.css';

function App() {
  // State for AI and Code Assistant
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState(<p className="text-muted mb-0">AI response will appear here...</p>);
  const [codePrompt, setCodePrompt] = useState("");
  const [codeOutput, setCodeOutput] = useState(<p className="text-muted mb-0">Code assistance will appear here...</p>);

  // Handlers for AI Text Generation
  async function generateText() {
    if (!aiPrompt.trim()) {
      setAiOutput(<p className="text-danger">Please enter a prompt</p>);
      return;
    }
    setAiOutput(<p className="text-muted">Generating... <span className="spinner-border spinner-border-sm" role="status"></span></p>);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: aiPrompt // <-- This is what your backend expects
        })
      });
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        throw new Error('Failed to process the response from the server');
      }
      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }
      // Hugging Face returns an array of summaries
      const content = Array.isArray(data) && data[0]?.summary_text ? data[0].summary_text : JSON.stringify(data);
      setAiOutput(<div className="p-3 bg-light rounded">{content}</div>);
    } catch (error) {
      setAiOutput(
        <div className="alert alert-danger">
          <strong>Error:</strong> {error.message}
          <div className="mt-2 small">
            <p>If this issue persists, please try again later.</p>
          </div>
        </div>
      );
    }
  }

  // Stub for Code Assistant (prevents ReferenceError)
  function getCodeHelp() {
    setCodeOutput(<p className="text-danger">Code Assistant is not implemented yet.</p>);
  }

  // Helper for asset paths (since CRA expects assets in public/)
  const asset = (path) => process.env.PUBLIC_URL + '/' + path;

  return (
    <div id="page-top">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="sideNav">
        <a className="navbar-brand js-scroll-trigger" href="#page-top">
          <span className="d-block d-lg-none">Ajmal Rasouli</span>
          <span className="d-none d-lg-block">
            <img className="img-fluid img-profile rounded-circle mx-auto mb-2" src={asset('assets/img/profile.jpg')} alt="..." />
          </span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav">
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#about">About</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#experience">Experience</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#education">Education</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#skills">Skills</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#interests">Interests</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#ai-projects">AI Projects</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="#certificate">Certificates</a></li>
            <li className="nav-item"><a className="nav-link js-scroll-trigger" href="https://ajmal.hashnode.dev/" target="_blank" rel="noopener noreferrer">Blogs</a></li>
            <li className="nav-item"><h2 className="mb-0"><img src="https://badge.tcblabs.net/api/hc/arasouli/index?TextBackgroundColorCode=coral" alt="visitor badge" /></h2></li>
          </ul>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container-fluid p-0">
        {/* About */}
        <section className="resume-section" id="about" style={{backgroundColor: '#f8f9fa', backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23bd5d38' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`, padding: '5rem 3rem', marginBottom: '2rem', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
          <div className="resume-section-content">
            <h1 className="mb-0">
              Ajmal <span className="text-primary">Rasouli</span>
            </h1>
            <div className="subheading mb-5">
              11 Ferndown Court · Haldane Road · Southall · London · UK · (07539) - 286398 ·
              <a href="mailto:ajmail@hotmail.co.uk">ajmail@hotmail.co.uk</a>
            </div>
            <p className="lead mb-5">A highly experienced and competent IT support technician with more than 15 years’ experience in a variety of office based environments. A level head and rational approach to problem solving leads to reliability and fast solutions to IT technical issues. An excellent communicator with the ability to explain procedures in a practical and user friendly way. Comfortable working as part of a team or independently with a focus on delivering quality IT support on a continuous basis.</p>
            <div className="social-icons">
              <a className="social-icon" href="https://linkedin.com/in/ajmal-rasouli-b0139226"><i className="fab fa-linkedin-in"></i></a>
              <a className="social-icon" href="https://github.com/ajmalrasouli"><i className="fab fa-github"></i></a>
              <a className="social-icon" href="https://twitter.com/manajmal"><i className="fab fa-twitter"></i></a>
              <a className="social-icon" href="https://www.facebook.com/ajmal.rasouli2/"><i className="fab fa-facebook-f"></i></a>
            </div>
          </div>
        </section>
        {/* Divider */}
        <hr className="m-0" style={{height: '3px', backgroundColor: '#bd5d38', opacity: 0.8, margin: '3rem 0', border: 'none'}} />

        {/* Experience Section */}
        <section className="resume-section" id="experience">
          <div className="resume-section-content">
            <h2 className="mb-5">Experience</h2>
            <div className="d-flex flex-column flex-md-row justify-content-between mb-5">
              <div className="flex-grow-1">
                <h3 className="mb-0">ICT Field Engineer</h3>
                <div className="subheading mb-3">Inspire ICT Ltd</div>
                <p>Providing comprehensive IT support and field engineering services. Specializing in system administration, network infrastructure, and end-user support. Key responsibilities include troubleshooting hardware and software issues, managing Active Directory, implementing network security measures, and providing 2nd line support. Proficient in virtualization technologies, PowerShell scripting, and maintaining server environments.</p>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">May 2022 - Present</span></div>
            </div>
            <hr className="my-4" />
            <div className="d-flex flex-column flex-md-row justify-content-between mb-5">
              <div className="flex-grow-1">
                <h3 className="mb-0">IT Technical Engineer</h3>
                <div className="subheading mb-3">Class Technology Solutions Ltd</div>
                <p>Resolving 1st/2nd line support calls from within my allocated schools. Supporting and maintaining the school's infrastructures and networks to ensure maximum service ability. Installation of new systems. Maintaining Network infrastructure. Resolving tickets issued by staff and teachers. Laptop / Desktop PC hardware repair. Smart boards / Projectors maintenance. Placing order for new equipment. Laising with third party. Active Directory, DHCP, DNS and Group policy updates and maintenance.</p>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">Oct 2018 - May 2022</span></div>
            </div>
            <hr className="my-4" />
            <div className="d-flex flex-column flex-md-row justify-content-between mb-5">
              <div className="flex-grow-1">
                <h3 className="mb-0">IT Support</h3>
                <div className="subheading mb-3">The Good Food Company</div>
                <p>Installing new systems. Providing training for all users. Repairing and upgrading hardware and ensuring all computers were fully operational. Creating and maintaining an accurate database of all pending and resolve IT issues. Diagnosing and resolving problems efficiently. Ensuring all hardware operates at its optimum level with latest updates and patches. Running diagnostic checks and servicing essential IT hardware.</p>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">October 2003 - October 2018</span></div>
            </div>
            <hr className="my-4" />
            <div className="d-flex flex-column flex-md-row justify-content-between mb-5">
              <div className="flex-grow-1">
                <h3 className="mb-0">Information Systems Assistant</h3>
                <div className="subheading mb-3">University of West London</div>
                <p>To provide systems an administrative support to the Administration Team, mainly Curriculum Information Officers, along with general administrative duties and all other tasks as reasonably requested.</p>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">May 2003 - Sept 2003</span></div>
            </div>
            <hr className="my-4" />
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <div className="flex-grow-1">
                <h3 className="mb-0">Administration Clerk</h3>
                <div className="subheading mb-3">The Ministry of Defence, Hayes</div>
                <p>Maintain files and records so they remain updated and easily accessible. Assist in office management and organization procedures. Perform other office duties as assigned.</p>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">Jan 2003 - July 2003</span></div>
            </div>
          </div>
        </section>
        <hr className="m-0" style={{height: '3px', backgroundColor: '#bd5d38', opacity: 0.8, margin: '3rem 0', border: 'none'}} />

        {/* Education Section */}
        <section className="resume-section" id="education">
          <div className="resume-section-content">
            <h2 className="mb-5">Education</h2>
            <div className="d-flex flex-column flex-md-row justify-content-between mb-5">
              <div className="flex-grow-1">
                <h3 className="mb-0">University of West London</h3>
                <div className="subheading mb-3">Bachelor of Science (BSc Hons)</div>
                <div>Computer Science - Information Systems</div>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">August 2005 - May 2007</span></div>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <div className="flex-grow-1">
                <h3 className="mb-0">University of West London</h3>
                <div className="subheading mb-3">Higher National Diploma (HND)</div>
                <div>Information Technology, E-Commerce</div>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">August 2004 - May 2005</span></div>
            </div>
            <br />
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <div className="flex-grow-1">
                <h3 className="mb-0">University of West London</h3>
                <div className="subheading mb-3">Higher National Certificate (HNC)</div>
                <div>Information Technology, E-Commerce</div>
              </div>
              <div className="flex-shrink-0"><span className="text-primary">August 2003 - May 2004</span></div>
            </div>
          </div>
        </section>
        <hr className="m-0" style={{height: '3px', backgroundColor: '#bd5d38', opacity: 0.8, margin: '3rem 0', border: 'none'}} />

        {/* Skills Section */}
        <section className="resume-section" id="skills">
          <div className="resume-section-content">
            <h2 className="mb-5">Skills</h2>
            <div className="subheading mb-3">Programming Languages & Tools</div>
            <ul className="list-inline dev-icons">
              <li className="list-inline-item"><i className="fab fa-html5"></i></li>
              <li className="list-inline-item"><i className="fab fa-css3-alt"></i></li>
              <li className="list-inline-item"><i className="fab fa-js-square"></i></li>
              <li className="list-inline-item"><i className="fab fa-python"></i></li>
              <li className="list-inline-item"><i className="fab fa-php"></i></li>
              <li className="list-inline-item"><i className="fab fa-linux"></i></li>
              <li className="list-inline-item"><i className="fab fa-github"></i></li>
              <li className="list-inline-item"><i className="fab fa-git"></i></li>
              <li className="list-inline-item"><i className="fab fa-amazon"></i></li>
              <li className="list-inline-item"><i className="fab fa-google"></i></li>
            </ul>
            <div className="subheading mb-3">Main Skills</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Experience of Cloud and Virtualisation platforms – such as; VMWare, Hyper-V, Azure</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Knowledge of automation and scripting technologies – Such as PowerShell and Bash</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Excellent Windows skills: Design, install, configuration, troubleshooting, and performance tuning</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Networking: LAN technologies, design, documentation, IP addressing</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Administering System Center Configuration Manager</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Linux client/server installation and configuration</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Experience in administering and troubleshooting Window Server operating systems, Active Directory and Group Policy. Windows Server 2012/2016/2019</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Microsoft Office 365 Excel and Word Expert</li>
              <li><span className="fa-li"><i className="fas fa-check"></i></span>Languages: PHP, XML, JavaScript, SQL, HTML, UML, Python.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 1 - Azure Cloud Resume Challenge</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Built a static website using HTML/CSS.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Wrote JavaScript code to trigger Azure Functions/CosmoDB API.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Deployed site to Azure Blob storage.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Enabled HTTPS and custom domain support using Azure CDN.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Automated workflow using Github Actions.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 2 - AWS Cloud Project Bootcamp - Exampro</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Utilized Docker for containerizing the application.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Implemented distributed tracing for enhanced monitoring.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Incorporated decentralized authentication mechanisms.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Integrated SQL database for structured data storage.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Employed a NoSQL database for flexible and scalable data storage.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Deployed serverless containers using AWS Fargate.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Resolved CORS issues with a custom domain and implemented load balancing.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Implemented serverless image processing using AWS Lambda.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Set up a CI/CD pipeline for continuous integration and deployment.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Utilized AWS CloudFormation for infrastructure as code.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Implemented modern APIs for improved communication and integration.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 3 - Terraform and Terraform Cloud - Exampro</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Explored Terraform basics and commands for formatting, validating, and console interactions.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Navigated the Terraform Registry to discover and use community-contributed modules.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Differentiated between Providers and Modules in Terraform.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Utilized Terraform Modules, understanding inputs and outputs for modular infrastructure.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Worked with Terraform variables for dynamic and reusable configurations.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Explored Terraform Outputs to retrieve and display information after deployment.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Defined and managed resources using Terraform.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Leveraged Terraform Data to retrieve and use external information in configurations.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 4 - Data Fundamentals - WeCloudData</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Gained a solid understanding of SQL fundamentals.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Applied SQL clauses, joins, and subqueries for effective data retrieval.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Performed data retrieval, transformation, and analysis using SQL.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Explored Python fundamentals, including functions and modules.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Applied Python Pandas DataFrame for efficient data manipulation.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Utilized PowerBI for data preparation, analysis, and visualization.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Designed and created dashboards for effective data representation.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Completed a capstone project with a final presentation showcasing acquired skills.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 5 - Teams Global Hack - Microsoft 365 & Power Platform Community 2023</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Participated in the Microsoft Teams Global Hack to build powerful apps for Microsoft Teams.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Developed an innovative app, named "HackTogether," during the hackathon.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Seized the unique opportunity to challenge myself and learn new skills.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Showcased talent by creating an app designed to encourage users to take regular breaks.</li>
            </ul>
            <div className="subheading mb-3">PROJECT 6 - GenAI Bootcamp (Red Squad) - Exampro.co 2025</div>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>build a collection of learning apps using various different use-cases of AI</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Maintain the learning experience the learning portal using AI developer tools.</li>
              <li><span className="fa-li"><i className="fas fa-minus"></i></span>Extend the platform to support various different languages.</li>
            </ul>
          </div>
        </section>
        <hr className="m-0" style={{height: '3px', backgroundColor: '#bd5d38', opacity: 0.8, margin: '3rem 0', border: 'none'}} />

        {/* AI Projects Section (with React state) */}
        <section className="resume-section" id="ai-projects">
          <div className="resume-section-content">
            <h2 className="mb-5">AI Projects</h2>
            <div className="card mb-4">
              <div className="card-body">
                <h3 className="card-title">AI Text Generator</h3>
                <p className="card-text">Try out this AI-powered text generator using OpenAI's API. It can help with writing, coding, and more!</p>
                <div className="mb-3">
                  <textarea className="form-control mb-2" id="aiPrompt" rows={3} placeholder="Enter your prompt here..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                  <button className="btn btn-primary" onClick={generateText}>Generate</button>
                </div>
                <div className="border p-3 bg-light rounded" id="aiOutput">
                  {aiOutput}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Code Assistant</h3>
                <p className="card-text">Get help with your code using DeepSeek's AI. Ask coding questions or get code explanations.</p>
                <div className="mb-3">
                  <textarea className="form-control mb-2" id="codePrompt" rows={3} placeholder="Ask a coding question or paste code..." value={codePrompt} onChange={e => setCodePrompt(e.target.value)} />
                  <button className="btn btn-primary" onClick={getCodeHelp}>Get Help</button>
                </div>
                <div className="border p-3 bg-light rounded" id="codeOutput">
                  {codeOutput}
                </div>
              </div>
            </div>
          </div>
        </section>
        <hr className="m-0" style={{height: '3px', backgroundColor: '#bd5d38', opacity: 0.8, margin: '3rem 0', border: 'none'}} />

        {/* Certificates Section */}
        <section className="resume-section" id="certificate">
          <div className="resume-section-content">
            <h2 className="mb-5">Certifications and Badges</h2>
            <ul className="fa-ul mb-0">
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>GenAI Bootcamp (Red Squad)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Professional Chrome Enterprise Administrator</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>SAA-C03 - AWS Certified Solutions Architect Associate</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>AI-102 - Microsoft Certified: Azure AI Engineer Associate</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>003 - HashiCorp Certified: Terraform Associate</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>CLF-C02 - AWS Certified Cloud Practitioner</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>AWS Educate Introduction to Cloud 101</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>SC-300: Microsoft Certified: Identity and Access Administrator Associate</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Foundational C# with Microsoft</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Teams Global Hack - Microsoft 365 & Power Platform Community 2023</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Project: Terraform Beginner Bootcamp (Terraformer)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Project: AWS Cloud Project Bootcamp Certificate (Gold Squad)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Project: Data Fundamentals CourseData - WeCloudData</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>AZ-104: Microsoft Certified: Azure Administrator Associate</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>AZ-900: Microsoft Certified: Azure Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>AI-900: Microsoft Certified: Azure AI Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>PL-900: Microsoft Certified: Power Platform Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>DP-900: Microsoft Azure Data Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>MB-901: Microsoft Dynamics 365 Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>MS-900 Microsoft 365 Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Microsoft Excel Expert (Microsoft 365 Apps and Office 2019)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Microsoft Word Expert (Microsoft 365 Apps and Office 2019)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Microsoft Outlook (Microsoft 365 Apps and Office 2019)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Microsoft PowerPoint (Microsoft 365 Apps and Office 2019)</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>MTA: Introduction to Programming Using HTML and CSS - Certified 2022</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>MTA: Introduction to Programming Using Python - Certified 2022</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>98-367:MTA: Security Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>98-366:MTA: Networking Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>98-365:MTA Windows Server Administration Fundamentals</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Certiprof: Cyber Security Foundation Professional Certificate - CSFPC</li>
              <li><span className="fa-li"><i className="fas fa-certificate text-warning"></i></span>Certiprof: Remote Work and Virtual Collaboration Professional Certificate - RWVCPC</li>
              <li><br /></li>
              {/* Badge Images */}
              <li>
                <a href=""><img src={asset('assets/img/aws-certified-cloud-practitioner.png')} alt="AWS Practitioner" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/aws-educate-introduction-to-cloud-101.png')} alt="AWS Cloud 101" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/microsoft-certified-identity-and-access-administrator-associate.png')} alt="Azure Identity Admin" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/teams-global-hack-microsoft-365-power-platform-comm.png')} alt="Global Hack Project" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/hashicorp-certified-terraform-associate-003.png')} alt="HashiCorp Associate" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/WeCloudData.png')} alt="WeCloudData" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/htmlcss.png')} alt="HTML and CSS" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/python.png')} alt="Intro to Python" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/awsbootcamp.png')} alt="AWS Bootcamp" height="100" width="100" /></a>
                <a href=""><img src={asset('assets/img/terraformer.png')} alt="Terraform Bootcamp" height="100" width="100" /></a>
                <a href="https://www.credly.com/badges/c19fc7f4-21e3-4676-b24c-393ba572b5e8/public_url"><img src={asset('assets/img/azure-administrator-associate.png')} alt="Azure Administrator Associate" /></a>
                <a href="https://www.credly.com/badges/b2b21040-526d-4f8a-a9fd-893438159bb4/public_url"><img src={asset('assets/img/azure-ai-fundamentals.png')} alt="Azure Artificial Intelligence" /></a>
                <a href="https://www.credly.com/badges/40bf089c-46b1-4562-9fce-ff702bfba4c5/public_url"><img src={asset('assets/img/azure-data-fundamentals.png')} alt="Azure Data Fundamentals" /></a>
                <a href="https://www.credly.com/badges/c6b116f5-947d-43b2-ad66-a0b421b0a85e/public_url"><img src={asset('assets/img/azure-fundamentals.png')} alt="Azure Fundamentals" /></a>
                <a href="https://www.credly.com/badges/a1a5f3c1-702e-4ef3-88b0-7d59bab97063/public_url"><img src={asset('assets/img/CERT-Fundamentals-Power-Platform.png')} alt="Power platform Fundamentals" /></a>
                <a href="https://www.credly.com/badges/55afc08f-7d0c-4b28-9f5c-69d9fa5f7ffc/public_url"><img src={asset('assets/img/Cybersecurity-Foundation-Professional-Certificate-CSFPC.png')} alt="Cybersecurity Foundation Professional Certificate - CSFPC" /></a>
                <a href="https://www.credly.com/badges/544b00e3-bdf9-4b5a-a40e-95ac96f6309f/public_url"><img src={asset('assets/img/dynamics365-fundamentals.png')} alt="Dynamics 365 Fundamentals" /></a>
                <a href="https://www.credly.com/badges/c31dd4db-d1aa-498d-af6a-9fe1925b1d9b/public_url"><img src={asset('assets/img/ai-102.png')} alt="AI-102 - Microsoft Certified: Azure AI Engineer Associate" height="100" width="100" /></a>
                <a href="https://www.credly.com/badges/af7c778d-79f7-489f-9592-5379786ce4ee/public_url"><img src={asset('assets/img/SAA-C03.png')} alt="SAA-C03 - AWS Certified Solutions Architect Associate" height="100" width="100" /></a>
                <a href="https://www.credly.com/badges/c31dd4db-d1aa-498d-af6a-9fe1925b1d9b/public_url"><img src={asset('assets/img/ChromeEnterpriseAdmin.png')} alt="Professional Chrome Enterprise Administrator" height="100" width="100" /></a>
                <a href="https://www.credly.com/badges/c31dd4db-d1aa-498d-af6a-9fe1925b1d9b/public_url"><img src={asset('assets/img/MTA-Networking_Fundamentals.png')} alt="Networking Fundamentals" /></a>
                <a href="https://www.credly.com/badges/c014c113-c4c9-4806-a286-7aaf77196a73/public_url"><img src={asset('assets/img/MTA-Windows_Server_Administration_Fundamentals.png')} alt="Windows Server Administration Fundamentals" /></a>
                <a href="https://www.credly.com/badges/121498f6-7c35-4f00-9590-61684fd8e554/public_url"><img src={asset('assets/img/Remote-Worker-and-Virtual-Collaborator-Professional-Certificate-RWVCPC.png')} alt="Remote Worker and Virtual Collaborator Professional Certificate - RWVCPC" /></a>
                <a href="https://www.credly.com/badges/69569476-c591-43ce-a89d-c6dc859c4dcf/public_url"><img src={asset('assets/img/MOS_-_Office_Specialist_Expert.png')} alt="Office Specialist Expert" /></a>
                <a href="https://www.credly.com/badges/37e64098-e83c-48c7-a0c7-20f0dc9e9b95/public_url"><img src={asset('assets/img/MOS_-_Office_Specialist_Associate.png')} alt="Office Specialist Associate" /></a>
                <a href="https://www.credly.com/badges/6bacd154-0dbe-4308-8530-9a0e1d24ca9f/public_url"><img src={asset('assets/img/MOS_Excel_Expert.png')} alt="Excel Expert" /></a>
                <a href="https://www.credly.com/badges/18809b5f-068c-48d4-ad27-4e0e624df0df/public_url"><img src={asset('assets/img/MOS_Word.png')} alt="Word" /></a>
                <a href="https://www.credly.com/badges/18809b5f-068c-48d4-ad27-4e0e624df0df/public_url"><img src={asset('assets/img/genai-cpb-red-badge.png')} alt="Exampro GenAI Bootcamp (Red Squad)" height="100" width="100" /></a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
