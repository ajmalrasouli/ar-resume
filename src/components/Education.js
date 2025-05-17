import React from "react";

const Education = () => (
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
);

export default Education;
