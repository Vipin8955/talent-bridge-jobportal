const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const { app } = require('../server');

// Helper to make HTTP requests against the Express app instance
let serverInstance;
let baseUrl = '';

const request = async (method, urlPath, headers = {}, body = null, isFormData = false, boundary = '') => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        ...headers,
      },
    };

    if (body && !isFormData && typeof body === 'object') {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
};

// Form data multipart builder
const createMultipartBody = (fields, fileField, fileName, fileBuffer, mimeType) => {
  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }

  if (fileField && fileBuffer) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
      )
    );
    parts.push(fileBuffer);
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    buffer: Buffer.concat(parts),
    boundary,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
  };
};

const runAllTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND INTEGRATION TESTS');
  console.log('=============================================\n');

  try {
    await connectDB();
    const port = 5999;
    serverInstance = app.listen(port);
    baseUrl = `http://localhost:${port}`;

    let applicantToken = '';
    let applicantId = '';
    let recruiter1Token = '';
    let recruiter1Id = '';
    let recruiter2Token = '';
    let testJobId = '';
    let testApplicationId = '';

    // Test 1: Health Check
    console.log('[TEST 1] Checking API Health endpoint...');
    const health = await request('GET', '/api/health');
    if (health.status === 200 && health.data.status === 'healthy') {
      console.log('  ✅ API Health check passed.');
    } else {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }

    // Test 2: User Registration & JWT issue
    console.log('\n[TEST 2] Testing User Registration (Applicant & Recruiter)...');
    const timestamp = Date.now();
    const appEmail = `test.applicant.${timestamp}@demo.com`;
    const rec1Email = `test.recruiter1.${timestamp}@demo.com`;
    const rec2Email = `test.recruiter2.${timestamp}@demo.com`;

    const regApplicant = await request('POST', '/api/auth/register', {}, {
      name: 'Test Applicant',
      email: appEmail,
      password: 'password123',
      role: 'applicant',
      skills: ['React', 'Node.js', 'MongoDB'],
    });

    if (regApplicant.status === 201 && regApplicant.data.token) {
      applicantToken = regApplicant.data.token;
      applicantId = regApplicant.data.user._id;
      console.log('  ✅ Applicant registered successfully with JWT.');
    } else {
      throw new Error(`Applicant registration failed: ${JSON.stringify(regApplicant.data)}`);
    }

    const regRecruiter1 = await request('POST', '/api/auth/register', {}, {
      name: 'Test Recruiter 1',
      email: rec1Email,
      password: 'password123',
      role: 'recruiter',
      company: 'Tech Alpha Inc',
      companyDescription: 'Pioneering innovative software.',
    });

    if (regRecruiter1.status === 201 && regRecruiter1.data.token) {
      recruiter1Token = regRecruiter1.data.token;
      recruiter1Id = regRecruiter1.data.user._id;
      console.log('  ✅ Recruiter 1 registered successfully with JWT.');
    } else {
      throw new Error(`Recruiter 1 registration failed: ${JSON.stringify(regRecruiter1.data)}`);
    }

    const regRecruiter2 = await request('POST', '/api/auth/register', {}, {
      name: 'Test Recruiter 2',
      email: rec2Email,
      password: 'password123',
      role: 'recruiter',
      company: 'Beta Labs',
    });
    recruiter2Token = regRecruiter2.data.token;

    // Test 3: Login Authentication
    console.log('\n[TEST 3] Testing Login with valid and invalid credentials...');
    const validLogin = await request('POST', '/api/auth/login', {}, {
      email: appEmail,
      password: 'password123',
    });
    if (validLogin.status === 200 && validLogin.data.token) {
      console.log('  ✅ Valid login succeeded.');
    } else {
      throw new Error('Valid login failed.');
    }

    const invalidLogin = await request('POST', '/api/auth/login', {}, {
      email: appEmail,
      password: 'wrong_password_123',
    });
    if (invalidLogin.status === 401) {
      console.log('  ✅ Invalid credentials correctly rejected with 401.');
    } else {
      throw new Error('Invalid credentials test failed.');
    }

    // Test 4: Protected Route /api/auth/me
    console.log('\n[TEST 4] Verifying Protected Route /api/auth/me...');
    const authMe = await request('GET', '/api/auth/me', {
      Authorization: `Bearer ${applicantToken}`,
    });
    if (authMe.status === 200 && authMe.data.user.email === appEmail) {
      console.log('  ✅ /api/auth/me authenticated user retrieved successfully.');
    } else {
      throw new Error('Auth me test failed.');
    }

    // Test 5: Role-Based Access Control (RBAC)
    console.log('\n[TEST 5] Testing RBAC Security & Forbidden Operations...');
    // Applicant trying to create a job
    const forbiddenJobCreate = await request(
      'POST',
      '/api/jobs',
      { Authorization: `Bearer ${applicantToken}` },
      { title: 'Hacked Job', company: 'Fake', description: 'Desc', location: 'Remote' }
    );
    if (forbiddenJobCreate.status === 403) {
      console.log('  ✅ Applicant blocked from creating job with 403 Forbidden.');
    } else {
      throw new Error(`RBAC failed for job creation: Status ${forbiddenJobCreate.status}`);
    }

    // Recruiter trying to apply to a job
    const forbiddenApply = await request(
      'POST',
      '/api/applications',
      { Authorization: `Bearer ${recruiter1Token}` },
      { jobId: '65e000000000000000000001' }
    );
    if (forbiddenApply.status === 403) {
      console.log('  ✅ Recruiter blocked from applying to job with 403 Forbidden.');
    } else {
      throw new Error(`RBAC failed for application: Status ${forbiddenApply.status}`);
    }

    // Test 6: Job Posting CRUD (Recruiter 1)
    console.log('\n[TEST 6] Testing Job Creation & Queries...');
    const createJobRes = await request(
      'POST',
      '/api/jobs',
      { Authorization: `Bearer ${recruiter1Token}` },
      {
        title: 'Senior Cloud Architect',
        company: 'Tech Alpha Inc',
        location: 'San Francisco, CA',
        isRemote: true,
        jobType: 'Full-time',
        experienceLevel: 'Senior Level',
        salary: { min: 150000, max: 190000, currency: 'USD', period: 'yearly' },
        skills: ['aws', 'kubernetes', 'node.js', 'docker'],
        description: 'Lead our next-generation cloud infrastructure roadmap.',
        requirements: ['5+ years AWS', 'Solid Kubernetes'],
        responsibilities: ['Architect microservices', 'Lead DevOps'],
      }
    );

    if (createJobRes.status === 201 && createJobRes.data.job?._id) {
      testJobId = createJobRes.data.job._id;
      console.log(`  ✅ Job created successfully with ID: ${testJobId}`);
    } else {
      throw new Error(`Job creation failed: ${JSON.stringify(createJobRes.data)}`);
    }

    // Test 7: Recruiter 2 attempts to edit Recruiter 1's job (Ownership check)
    console.log('\n[TEST 7] Testing Cross-Recruiter Ownership Enforcement...');
    const crossEdit = await request(
      'PUT',
      `/api/jobs/${testJobId}`,
      { Authorization: `Bearer ${recruiter2Token}` },
      { title: 'Hacked Title' }
    );
    if (crossEdit.status === 403) {
      console.log('  ✅ Recruiter 2 blocked from editing Recruiter 1’s job with 403 Forbidden.');
    } else {
      throw new Error(`Ownership check failed: Status ${crossEdit.status}`);
    }

    // Test 8: Job Search & Filtering
    console.log('\n[TEST 8] Testing Public Job Search & Keyword Queries...');
    const searchRes = await request('GET', '/api/jobs?keyword=Cloud&jobType=Full-time');
    if (searchRes.status === 200 && searchRes.data.jobs.length > 0) {
      console.log(`  ✅ Search returned ${searchRes.data.jobs.length} matched jobs with pagination.`);
    } else {
      throw new Error('Search query test failed.');
    }

    // Test 9: Application Submission with File Upload
    console.log('\n[TEST 9] Testing Application Submission with Resume PDF...');
    const dummyPdf = Buffer.from('%PDF-1.4\n%EOF');
    const multipart = createMultipartBody(
      { jobId: testJobId, coverLetter: 'I am excited about this Cloud Architect role!' },
      'resume',
      'alex_rivera_resume.pdf',
      dummyPdf,
      'application/pdf'
    );

    const applyRes = await request(
      'POST',
      '/api/applications',
      {
        Authorization: `Bearer ${applicantToken}`,
        ...multipart.headers,
      },
      multipart.buffer,
      true
    );

    if (applyRes.status === 201 && applyRes.data.application?._id) {
      testApplicationId = applyRes.data.application._id;
      console.log(`  ✅ Application submitted successfully with resume upload (ID: ${testApplicationId})`);
    } else {
      throw new Error(`Application submission failed: ${JSON.stringify(applyRes.data)}`);
    }

    // Test 10: Duplicate Application Prevention
    console.log('\n[TEST 10] Testing Duplicate Application Prevention...');
    const duplicateApply = await request(
      'POST',
      '/api/applications',
      {
        Authorization: `Bearer ${applicantToken}`,
        ...multipart.headers,
      },
      multipart.buffer,
      true
    );

    if (duplicateApply.status === 400) {
      console.log('  ✅ Duplicate application successfully rejected with 400.');
    } else {
      throw new Error(`Duplicate application test failed: Status ${duplicateApply.status}`);
    }

    // Test 11: Recruiter Candidate Management & Status Update
    console.log('\n[TEST 11] Testing Recruiter Candidate Review & Status Update...');
    const candidatesRes = await request(
      'GET',
      `/api/applications/job/${testJobId}`,
      { Authorization: `Bearer ${recruiter1Token}` }
    );

    if (candidatesRes.status === 200 && candidatesRes.data.applications.length === 1) {
      console.log('  ✅ Recruiter successfully listed candidates for their job.');
    } else {
      throw new Error(`Candidates list failed: ${JSON.stringify(candidatesRes.data)}`);
    }

    // Update status to 'Shortlisted'
    const statusUpdateRes = await request(
      'PATCH',
      `/api/applications/${testApplicationId}/status`,
      { Authorization: `Bearer ${recruiter1Token}` },
      { status: 'Shortlisted', notes: 'Top candidate from initial screening.' }
    );

    if (statusUpdateRes.status === 200 && statusUpdateRes.data.application.status === 'Shortlisted') {
      console.log('  ✅ Candidate status updated to "Shortlisted" by Recruiter.');
    } else {
      throw new Error(`Status update failed: ${JSON.stringify(statusUpdateRes.data)}`);
    }

    // Test 12: Applicant sees updated status
    console.log('\n[TEST 12] Verifying Applicant sees updated status...');
    const myApps = await request('GET', '/api/applications/my', {
      Authorization: `Bearer ${applicantToken}`,
    });

    if (
      myApps.status === 200 &&
      myApps.data.applications[0]?.status === 'Shortlisted'
    ) {
      console.log('  ✅ Applicant correctly receives updated "Shortlisted" status in their list.');
    } else {
      throw new Error('Applicant status verification failed.');
    }

    // Test 13: Resume Download
    console.log('\n[TEST 13] Testing Secure Resume Retrieval...');
    const resumeDownload = await request(
      'GET',
      `/api/applications/${testApplicationId}/resume`,
      { Authorization: `Bearer ${recruiter1Token}` }
    );

    if (resumeDownload.status === 200) {
      console.log('  ✅ Resume downloaded successfully with status 200.');
    } else {
      throw new Error(`Resume download failed: Status ${resumeDownload.status}`);
    }

    console.log('\n=============================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED 100% SUCCESFULLY!');
    console.log('=============================================\n');

    serverInstance.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err);
    if (serverInstance) serverInstance.close();
    await disconnectDB();
    process.exit(1);
  }
};

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
