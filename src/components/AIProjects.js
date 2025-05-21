import React from "react";

const AIProjects = ({ aiPrompt, setAiPrompt, aiOutput, generateText }) => (
  <section className="resume-section" id="ai-projects">
    <div className="resume-section-content">
      <h2 className="mb-5">AI Projects</h2>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">AI Text Generator</h3>
          <p className="card-text">Try out this AI-powered text generator. It can help with writing and more!</p>
          <div className="mb-3">
            <textarea 
              className="form-control mb-2" 
              rows={3} 
              placeholder="Enter your prompt here..." 
              value={aiPrompt} 
              onChange={e => setAiPrompt(e.target.value)} 
            />
            <button className="btn btn-primary" onClick={generateText}>
              Generate
            </button>
          </div>
          <div className="border p-3 bg-light rounded">
            {aiOutput}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AIProjects;
