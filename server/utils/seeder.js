const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Create dummy PDF files for seed resumes if they don't exist
const ensureSampleResumes = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sampleResumes = [
    'alex_rivera_resume.pdf',
    'emily_watson_resume.pdf',
    'david_kim_resume.pdf',
  ];

  sampleResumes.forEach((fileName) => {
    const filePath = path.join(uploadDir, fileName);
    if (!fs.existsSync(filePath)) {
      // Create minimal valid PDF content structure
      const samplePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 18 Tf
50 700 Td
(Sample Candidate Resume - JobPortal Portfolio Demo) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
320
%%EOF`;
      fs.writeFileSync(filePath, samplePdfContent);
    }
  });
};

const mongoose = require('mongoose');

const seedData = async (standalone = true) => {
  try {
    if (standalone && mongoose.connection.readyState !== 1) {
      console.log('[Seeder] Connecting to database...');
      await connectDB();
    }

    console.log('[Seeder] Ensuring sample resume assets...');
    ensureSampleResumes();

    console.log('[Seeder] Clearing existing data...');
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});

    console.log('[Seeder] Creating Demo Users...');

    // 1. Create Recruiters
    const recruiter1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      company: 'TechCorp Global',
      companyDescription:
        'TechCorp Global is a leader in enterprise cloud solutions and modern web architectures, powering scalable applications for Fortune 500 companies.',
      website: 'https://techcorpglobal.example.com',
      bio: 'Lead Talent Acquisition Partner at TechCorp Global specializing in engineering and product leadership.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const recruiter2 = await User.create({
      name: 'Michael Chang',
      email: 'recruiter@innovate.io',
      password: 'password123',
      role: 'recruiter',
      phone: '+1 (555) 876-5432',
      location: 'New York, NY',
      company: 'Innovate Labs',
      companyDescription:
        'Innovate Labs is a high-growth AI and Fintech venture studio building next-generation digital products and intelligent automation tools.',
      website: 'https://innovatelabs.example.com',
      bio: 'Head of People & Culture at Innovate Labs. Passionate about connecting world-class talent with visionary products.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    // 2. Create Applicants
    const applicant1 = await User.create({
      name: 'Alex Rivera',
      email: 'applicant@demo.com',
      password: 'password123',
      role: 'applicant',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      bio: 'Passionate Full-Stack Developer with 4+ years of hands-on experience building scalable web apps with React, Node.js, and MongoDB.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'Git'],
      experience: [
        {
          title: 'Full Stack Engineer',
          company: 'Nexus Software Solutions',
          years: '2022 - Present',
          description: 'Built high-throughput REST APIs and responsive React dashboards for over 50,000 active users.',
        },
        {
          title: 'Frontend Developer',
          company: 'PixelCraft Studios',
          years: '2020 - 2022',
          description: 'Designed component libraries and optimized single-page application performance.',
        },
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of Texas at Austin',
          year: '2020',
        },
      ],
      resume: {
        url: '/uploads/resumes/alex_rivera_resume.pdf',
        originalName: 'Alex_Rivera_Software_Engineer.pdf',
        size: 245000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    const applicant2 = await User.create({
      name: 'Emily Watson',
      email: 'emily@demo.com',
      password: 'password123',
      role: 'applicant',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      bio: 'Product Designer and UI/UX strategist focused on clean human-computer interaction, accessible design systems, and rapid prototyping.',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping', 'CSS3', 'HTML5'],
      experience: [
        {
          title: 'Senior Product Designer',
          company: 'Veloce Digital',
          years: '2021 - Present',
          description: 'Led end-to-end UX architecture and design system for B2B SaaS analytics tools.',
        },
      ],
      education: [
        {
          degree: 'B.A. in Interaction Design',
          institution: 'University of Washington',
          year: '2019',
        },
      ],
      resume: {
        url: '/uploads/resumes/emily_watson_resume.pdf',
        originalName: 'Emily_Watson_UI_UX_Designer.pdf',
        size: 312000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    const applicant3 = await User.create({
      name: 'David Kim',
      email: 'david@demo.com',
      password: 'password123',
      role: 'applicant',
      phone: '+1 (555) 567-8901',
      location: 'Chicago, IL',
      bio: 'DevOps & Site Reliability Engineer specializing in Kubernetes, AWS cloud infrastructure, CI/CD automation, and high availability.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Prometheus'],
      experience: [
        {
          title: 'DevOps Engineer',
          company: 'CloudScale Technologies',
          years: '2021 - Present',
          description: 'Maintained zero-downtime cloud infrastructure across AWS multi-region clusters.',
        },
      ],
      education: [
        {
          degree: 'B.S. in Information Systems',
          institution: 'Illinois Institute of Technology',
          year: '2021',
        },
      ],
      resume: {
        url: '/uploads/resumes/david_kim_resume.pdf',
        originalName: 'David_Kim_DevOps_Engineer.pdf',
        size: 198000,
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    console.log('[Seeder] Creating Job Postings...');

    const jobsData = [
      {
        title: 'Senior Full-Stack Engineer (React & Node)',
        company: 'TechCorp Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description:
          'We are seeking an experienced Full-Stack Engineer to architect, develop, and maintain high-performance web applications. You will collaborate with cross-functional teams to build intuitive frontends in React and resilient backend services in Node.js and MongoDB.',
        requirements: [
          '5+ years of production experience with JavaScript/TypeScript, React, and Node.js.',
          'Solid understanding of MongoDB, schema design, and query optimization.',
          'Experience building and documenting RESTful APIs.',
          'Familiarity with containerization (Docker) and CI/CD pipelines.',
          'Strong communication skills and collaborative mindset.',
        ],
        responsibilities: [
          'Design and implement scalable microservices and RESTful endpoints.',
          'Build reusable React components adhering to modern UX and accessibility standards.',
          'Participate in code reviews, architectural planning, and sprint retrospectives.',
          'Optimize web performance, security, and data protection practices.',
        ],
        location: 'San Francisco, CA',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Senior Level',
        salary: { min: 140000, max: 175000, currency: 'USD', period: 'yearly' },
        skills: ['react', 'node.js', 'mongodb', 'express', 'javascript', 'docker'],
        recruiter: recruiter1._id,
        status: 'active',
      },
      {
        title: 'Frontend React Developer',
        company: 'TechCorp Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description:
          'Join our core frontend team to build modern, responsive web experiences. You will translate product designs into pixel-perfect React interfaces with Tailwind CSS and clean state management.',
        requirements: [
          '2+ years of professional React.js development experience.',
          'Deep proficiency with modern CSS, Tailwind CSS, and responsive layouts.',
          'Experience with state management and REST API integration with Axios.',
          'Passion for clean UI, micro-interactions, and web performance.',
        ],
        responsibilities: [
          'Develop interactive user interfaces and dashboard modules.',
          'Ensure cross-browser compatibility and responsive performance across mobile and desktop.',
          'Collaborate with UX designers to refine design tokens and component standards.',
        ],
        location: 'Remote',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Mid Level',
        salary: { min: 95000, max: 125000, currency: 'USD', period: 'yearly' },
        skills: ['react', 'tailwind css', 'javascript', 'html5', 'css3', 'git'],
        recruiter: recruiter1._id,
        status: 'active',
      },
      {
        title: 'Backend Node.js & API Developer',
        company: 'TechCorp Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description:
          'We are looking for a backend specialist to build reliable APIs, manage database integrations, and implement secure role-based access systems.',
        requirements: [
          '3+ years of backend engineering in Node.js and Express.',
          'Proficiency with MongoDB / Mongoose, indexing, and data modeling.',
          'Solid understanding of JWT authentication, OAuth, and API security.',
          'Experience with automated unit and integration testing.',
        ],
        responsibilities: [
          'Develop robust backend APIs and middleware.',
          'Ensure high performance, responsiveness, and error handling.',
          'Implement data protection and role authorization logic.',
        ],
        location: 'Austin, TX',
        isRemote: false,
        jobType: 'Full-time',
        experienceLevel: 'Mid Level',
        salary: { min: 105000, max: 135000, currency: 'USD', period: 'yearly' },
        skills: ['node.js', 'express', 'mongodb', 'jwt', 'rest apis'],
        recruiter: recruiter1._id,
        status: 'active',
      },
      {
        title: 'Cloud DevOps Engineer',
        company: 'TechCorp Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description:
          'TechCorp is seeking a Cloud DevOps Engineer to streamline infrastructure deployments, manage Kubernetes clusters, and automate CI/CD workflows.',
        requirements: [
          '3+ years experience with AWS or GCP cloud environments.',
          'Hands-on expertise with Docker, Kubernetes, and Helm charts.',
          'Infrastructure as Code (IaC) with Terraform or CloudFormation.',
          'Strong scripting skills in Bash or Python.',
        ],
        responsibilities: [
          'Maintain Kubernetes infrastructure and monitoring solutions.',
          'Automate deployment pipelines with GitHub Actions.',
          'Ensure high availability, disaster recovery, and compliance.',
        ],
        location: 'San Francisco, CA',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Senior Level',
        salary: { min: 135000, max: 165000, currency: 'USD', period: 'yearly' },
        skills: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd'],
        recruiter: recruiter1._id,
        status: 'active',
      },
      {
        title: 'Product Designer (UI/UX)',
        company: 'Innovate Labs',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description:
          'Innovate Labs is looking for a versatile UI/UX Designer to design delightful user experiences across web and mobile products in AI and fintech.',
        requirements: [
          '3+ years of product design experience for SaaS applications.',
          'Expert-level mastery of Figma, design systems, and interactive prototypes.',
          'Demonstrated ability to conduct user testing and translate insights into wireframes.',
          'Strong portfolio showcasing problem-solving and visual craft.',
        ],
        responsibilities: [
          'Lead design workflows from discovery and wireframes to high-fidelity mockups.',
          'Maintain and evolve our multi-brand design system.',
          'Partner closely with engineers during implementation and QA.',
        ],
        location: 'New York, NY',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Senior Level',
        salary: { min: 110000, max: 145000, currency: 'USD', period: 'yearly' },
        skills: ['figma', 'ui/ux design', 'design systems', 'prototyping', 'user research'],
        recruiter: recruiter2._id,
        status: 'active',
      },
      {
        title: 'Junior Web Developer',
        company: 'Innovate Labs',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description:
          'Great opportunity for an ambitious junior developer to learn and grow within a high-velocity startup environment. You will contribute to frontend components and API endpoints under senior mentorship.',
        requirements: [
          'Strong foundational knowledge of JavaScript (ES6+), HTML, and CSS.',
          'Familiarity with React or Node.js through coursework or personal projects.',
          'Eagerness to learn best practices and receive code reviews.',
        ],
        responsibilities: [
          'Build and test user interface components.',
          'Assist in writing bug fixes and documentation.',
          'Participate in daily standups and sprint reviews.',
        ],
        location: 'New York, NY',
        isRemote: false,
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salary: { min: 65000, max: 80000, currency: 'USD', period: 'yearly' },
        skills: ['javascript', 'html5', 'css3', 'react', 'git'],
        recruiter: recruiter2._id,
        status: 'active',
      },
      {
        title: 'Full-Stack Software Engineering Intern',
        company: 'Innovate Labs',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description:
          'Summer internship program for CS students or bootcamp graduates. Work on real production features with hands-on mentoring from our engineering leads.',
        requirements: [
          'Currently pursuing or recently completed a degree in Computer Science or related field.',
          'Basic understanding of web technologies and Git.',
          'Enthusiasm for solving challenging technical problems.',
        ],
        responsibilities: [
          'Develop small feature modules alongside senior developers.',
          'Write unit tests and verify application behavior.',
          'Present internship project to the team at the end of the term.',
        ],
        location: 'Remote',
        isRemote: true,
        jobType: 'Internship',
        experienceLevel: 'Internship',
        salary: { min: 30, max: 40, currency: 'USD', period: 'hourly' },
        skills: ['javascript', 'react', 'node.js', 'git'],
        recruiter: recruiter2._id,
        status: 'active',
      },
      {
        title: 'Lead Architect / Principal Engineer',
        company: 'Innovate Labs',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description:
          'Drive the technical vision and architectural standards for our distributed systems and fintech pipelines.',
        requirements: [
          '8+ years of software engineering experience with large-scale systems.',
          'Deep expertise in distributed architectures, microservices, and database performance.',
          'Track record of mentoring engineering teams and defining technical roadmaps.',
        ],
        responsibilities: [
          'Define architectural guidelines and technical best practices.',
          'Lead technical discussions and evaluate new technologies.',
          'Ensure resilience, performance, and security across all services.',
        ],
        location: 'Boston, MA',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Lead / Principal',
        salary: { min: 180000, max: 220000, currency: 'USD', period: 'yearly' },
        skills: ['node.js', 'mongodb', 'system design', 'microservices', 'aws', 'architecture'],
        recruiter: recruiter2._id,
        status: 'active',
      },
      {
        title: 'Contract QA Automation Engineer',
        company: 'TechCorp Global',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description:
          '6-month contract to develop end-to-end test automation suites using Playwright, Cypress, and Jest.',
        requirements: [
          '3+ years in automated quality assurance testing.',
          'Proficiency with Cypress, Playwright, or Selenium.',
          'Experience setting up automated test execution in CI/CD.',
        ],
        responsibilities: [
          'Build and maintain automated test scripts.',
          'Identify, isolate, and document software regressions.',
          'Work with development teams to ensure high test coverage.',
        ],
        location: 'Remote',
        isRemote: true,
        jobType: 'Contract',
        experienceLevel: 'Mid Level',
        salary: { min: 55, max: 75, currency: 'USD', period: 'hourly' },
        skills: ['qa automation', 'cypress', 'playwright', 'javascript', 'ci/cd'],
        recruiter: recruiter1._id,
        status: 'active',
      },
      {
        title: 'Part-Time Technical Content Writer',
        company: 'Innovate Labs',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
        description:
          'Create high-quality developer documentation, tutorials, and technical blog posts explaining modern web and cloud architectures.',
        requirements: [
          'Strong writing skills with technical literacy in web development and APIs.',
          'Ability to write concise code examples in JavaScript.',
        ],
        responsibilities: [
          'Write technical articles, guides, and changelogs.',
          'Collaborate with product managers to document new feature releases.',
        ],
        location: 'Remote',
        isRemote: true,
        jobType: 'Part-time',
        experienceLevel: 'Mid Level',
        salary: { min: 35, max: 50, currency: 'USD', period: 'hourly' },
        skills: ['technical writing', 'markdown', 'javascript', 'apis'],
        recruiter: recruiter2._id,
        status: 'active',
      },
    ];

    const createdJobs = await Job.create(jobsData);
    console.log(`[Seeder] Created ${createdJobs.length} Job postings.`);

    console.log('[Seeder] Creating Realistic Applications...');

    const applicationsData = [
      // Alex Rivera applies to TechCorp Senior Full-Stack
      {
        applicant: applicant1._id,
        job: createdJobs[0]._id,
        recruiter: recruiter1._id,
        resume: applicant1.resume,
        coverLetter:
          'Dear TechCorp Hiring Team,\n\nI am thrilled to apply for the Senior Full-Stack Engineer role. With 4+ years building production React and Node.js systems, I have scaled applications handling high concurrency and delivered intuitive user experiences. I look forward to contributing to your team.',
        status: 'Shortlisted',
        notes: 'Candidate has very strong React and MongoDB experience. Portfolio looks great. Schedule technical interview.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 5 * 86400000), notes: 'Application submitted.' },
          { status: 'Reviewing', changedAt: new Date(Date.now() - 3 * 86400000), notes: 'Initial resume screening passed.' },
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 1 * 86400000), notes: 'Candidate shortlisted for technical round.' },
        ],
        appliedAt: new Date(Date.now() - 5 * 86400000),
      },
      // Alex Rivera applies to Frontend React Developer
      {
        applicant: applicant1._id,
        job: createdJobs[1]._id,
        recruiter: recruiter1._id,
        resume: applicant1.resume,
        coverLetter:
          'Hi Sarah,\n\nI love building performant, pixel-perfect frontend experiences with React and Tailwind CSS. I have deep knowledge of responsive UI design and state management.',
        status: 'Reviewing',
        notes: 'Reviewing code samples and GitHub repositories.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 2 * 86400000), notes: 'Application submitted.' },
          { status: 'Reviewing', changedAt: new Date(Date.now() - 1 * 86400000), notes: 'Moved to review stage.' },
        ],
        appliedAt: new Date(Date.now() - 2 * 86400000),
      },
      // Emily Watson applies to Product Designer
      {
        applicant: applicant2._id,
        job: createdJobs[4]._id,
        recruiter: recruiter2._id,
        resume: applicant2.resume,
        coverLetter:
          'Dear Innovate Labs Team,\n\nI am eager to bring my 3+ years of SaaS product design experience to Innovate Labs. Having designed complex dashboard flows and scalable design systems, I thrive at the intersection of usability and visual craft.',
        status: 'Hired',
        notes: 'Exceptional design portfolio and cultural fit. Offer accepted!',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 10 * 86400000), notes: 'Application submitted.' },
          { status: 'Reviewing', changedAt: new Date(Date.now() - 8 * 86400000), notes: 'Portfolio reviewed.' },
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 5 * 86400000), notes: 'Design challenge passed.' },
          { status: 'Hired', changedAt: new Date(Date.now() - 1 * 86400000), notes: 'Offer accepted.' },
        ],
        appliedAt: new Date(Date.now() - 10 * 86400000),
      },
      // David Kim applies to Cloud DevOps Engineer
      {
        applicant: applicant3._id,
        job: createdJobs[3]._id,
        recruiter: recruiter1._id,
        resume: applicant3.resume,
        coverLetter:
          'Hello,\n\nI have extensive experience managing Kubernetes clusters and automating Terraform configurations on AWS. I would love to support TechCorp’s infrastructure reliability goals.',
        status: 'Applied',
        notes: '',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 1 * 86400000), notes: 'Application submitted.' },
        ],
        appliedAt: new Date(Date.now() - 1 * 86400000),
      },
    ];

    const createdApplications = await Application.create(applicationsData);
    console.log(`[Seeder] Created ${createdApplications.length} sample applications.`);

    // Update applicationsCount on jobs
    for (const job of createdJobs) {
      const count = await Application.countDocuments({ job: job._id });
      await Job.findByIdAndUpdate(job._id, { applicationsCount: count });
    }

    console.log('\n=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('\nDemo Recruiter Accounts:');
    console.log('  1. recruiter@techcorp.com   | Password: password123 (TechCorp Global)');
    console.log('  2. recruiter@innovate.io    | Password: password123 (Innovate Labs)');
    console.log('\nDemo Applicant Accounts:');
    console.log('  1. applicant@demo.com       | Password: password123 (Alex Rivera - Full Stack)');
    console.log('  2. emily@demo.com           | Password: password123 (Emily Watson - UI/UX)');
    console.log('  3. david@demo.com           | Password: password123 (David Kim - DevOps)');
    console.log('=============================================\n');

    if (standalone) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seeder] Error seeding database:', err);
    if (standalone) {
      await disconnectDB();
      process.exit(1);
    }
    throw err;
  }
};

// Run seeder directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
