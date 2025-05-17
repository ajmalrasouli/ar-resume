import React from "react";

const Navbar = ({ asset }) => (
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
);

export default Navbar;
