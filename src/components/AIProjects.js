import React from "react";

const AIProjects = ({ aiPrompt, setAiPrompt, aiOutput, generateText, codePrompt, setCodePrompt, codeOutput, getCodeHelp }) => (
  <section className="resume-section" id="ai-projects">
    <div className="resume-section-content">
      <h2 className="mb-5">AI Projects</h2>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">AI Text Generator</h3>
          <p className="card-text">Try out this AI-powered text generator using Hugging Face's API. It can help with writing, coding, and more!</p>
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
);

export default AIProjects;
