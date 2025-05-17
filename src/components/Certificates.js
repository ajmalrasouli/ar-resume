import React from "react";

const Certificates = ({ asset }) => (
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
);

export default Certificates;
