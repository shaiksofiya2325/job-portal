document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const employerDashboard = document.getElementById('employer-dashboard');
    const seekerDashboard = document.getElementById('seeker-dashboard');
    let currentUser = null; // Store the logged-in user's data

    // --- Common Functions ---
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                window.location.href = '/login.html';
                return;
            }
            currentUser = await res.json(); // Save user data
            welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
            
            if (currentUser.role === 'employer') {
                employerDashboard.style.display = 'block';
                loadEmployerDashboard();
            } else {
                seekerDashboard.style.display = 'block';
                loadSeekerDashboard(currentUser); // Pass user data
            }
        } catch (err) {
            console.error(err);
            window.location.href = '/login.html';
        }
    };
    
    // --- Employer Dashboard ---
    const loadEmployerDashboard = () => {
        const postJobForm = document.getElementById('post-job-form');
        const postJobMessage = document.getElementById('post-job-message');
        const jobListContainer = document.getElementById('employer-job-list');

        // Handle job posting
        postJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            postJobMessage.textContent = '';
            
            const jobData = {
                title: document.getElementById('title').value,
                location: document.getElementById('location').value,
                jobType: document.getElementById('jobType').value,
                description: document.getElementById('description').value,
                requirements: document.getElementById('requirements').value,
            };

            try {
                const res = await fetch('/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jobData)
                });
                
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || 'Failed to post job');
                }
                
                postJobMessage.textContent = 'Job posted successfully!';
                postJobMessage.className = 'success';
                postJobForm.reset();
                fetchPostedJobs(); // Refresh the list
            } catch (err) {
                postJobMessage.textContent = err.message;
                postJobMessage.className = '';
            }
        });

        // Fetch and display posted jobs
        const fetchPostedJobs = async () => {
            try {
                const res = await fetch('/api/jobs/employer/my-jobs');
                
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || `Server error: ${res.status}`);
                }

                const jobs = await res.json();
                
                jobListContainer.innerHTML = '';
                if (jobs.length === 0) {
                    jobListContainer.innerHTML = '<p>You have not posted any jobs yet.</p>';
                    return;
                }

                jobs.forEach(job => {
                    const jobItem = document.createElement('div');
                    jobItem.className = 'dashboard-job-item';
                    
                    // --- THIS FUNCTION NOW CONTAINS THE FIX ---
                    const createApplicantList = (applications) => {
                        if (applications.length === 0) {
                            return '<p>No applicants yet.</p>';
                        }
                        
                        return applications.map(app => {
                            // Use optional chaining (?.) to prevent errors
                            const applicantName = app.applicant?.name || 'Deleted User';
                            const applicantEmail = app.applicant?.email || 'N/A';
                            const applicantId = app.applicant?._id;

                            // If the applicant doesn't exist, don't make it a link
                            const nameHTML = applicantId
                                ? `<a href="/profile.html?id=${applicantId}" target="_blank">${applicantName}</a>`
                                : applicantName;

                            return `
                            <div class="applicant-item">
                                <div>
                                    <strong>${nameHTML}</strong> 
                                    (${applicantEmail})
                                </div>
                                <select class="status-select" data-job-id="${job._id}" data-app-id="${app._id}">
                                    <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                                    <option value="Viewed" ${app.status === 'Viewed' ? 'selected' : ''}>Viewed</option>
                                    <option value="Interviewing" ${app.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                                    <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                    <option value="Hired" ${app.status === 'Hired' ? 'selected' : ''}>Hired</option>
                                </select>
                            </div>
                            `;
                        }).join('');
                    };

                    jobItem.innerHTML = `
                        <div class="job-item-header">
                            <div>
                                <h4>${job.title}</h4>
                                <p>${job.location} | ${job.jobType}</p>
                            </div>
                            <div class="dashboard-job-actions">
                                <button class="btn btn-danger" data-id="${job._id}">Delete</button>
                            </div>
                        </div>
                        <div class="applicant-list">
                            <h5>Applicants (${job.applications.length})</h5>
                            ${createApplicantList(job.applications)}
                        </div>
                    `;
                    jobListContainer.appendChild(jobItem);
                });
            } catch (err) {
                console.error('Error in fetchPostedJobs:', err);
                jobListContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
            }
        };
        
        // Event listener for delete buttons
        jobListContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-danger')) {
                const jobId = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this job?')) {
                    try {
                        const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Failed to delete job');
                        fetchPostedJobs(); // Refresh list
                    } catch (err) {
                        alert(err.message);
                    }
                }
            }
        });

        // Event listener for status changes
        jobListContainer.addEventListener('change', async (e) => {
            if (e.target.classList.contains('status-select')) {
                const selectEl = e.target;
                const jobId = selectEl.getAttribute('data-job-id');
                const appId = selectEl.getAttribute('data-app-id');
                const newStatus = selectEl.value;
                
                try {
                    const res = await fetch(`/api/jobs/${jobId}/applications/${appId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    });
                    
                    if (!res.ok) throw new Error('Failed to update status');
                    
                } catch (err) {
                    alert(err.message);
                    fetchPostedJobs(); // Revert on failure
                }
            }
        });

        fetchPostedJobs();
    };

    // --- Seeker Dashboard ---
    const loadSeekerDashboard = (user) => {
        const appListContainer = document.getElementById('seeker-application-list');
        const profileForm = document.getElementById('profile-form');
        const profileMessage = document.getElementById('profile-message');

        // Populate Profile Form
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-contact').value = user.contact || '';
        document.getElementById('profile-bio').value = user.bio || '';
        document.getElementById('profile-skills').value = user.skills ? user.skills.join(', ') : '';

        // Handle Profile Form Submit
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            profileMessage.textContent = 'Updating...';
            profileMessage.className = '';

            const profileData = {
                name: document.getElementById('profile-name').value,
                contact: document.getElementById('profile-contact').value,
                bio: document.getElementById('profile-bio').value,
                skills: document.getElementById('profile-skills').value
            };

            try {
                const res = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profileData)
                });
                
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to update profile');
                }
                
                profileMessage.textContent = 'Profile updated successfully!';
                profileMessage.className = 'success';
                
                const updatedUser = await res.json();
                welcomeMessage.textContent = `Welcome, ${updatedUser.name}!`;

            } catch (err) {
                profileMessage.textContent = err.message;
            }
        });

        // Fetch applications
        const fetchApplications = async () => {
            try {
                const res = await fetch('/api/jobs/seeker/my-applications');

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || `Server error: ${res.status}`);
                }

                const jobs = await res.json();
                
                appListContainer.innerHTML = '';
                if (jobs.length === 0) {
                    appListContainer.innerHTML = '<p>You have not applied for any jobs yet.</p>';
                    return;
                }

                jobs.forEach(job => {
                    const jobItem = document.createElement('div');
                    jobItem.className = 'dashboard-job-item';
                    jobItem.innerHTML = `
                        <div>
                            <h4><a href="/job-details.html?id=${job._id}">${job.title}</a></h4>
                            <p>${job.postedBy.name} | ${job.location}</p>
                        </div>
                        <div>
                            <p><strong>Status: <span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span></strong></p>
                        </div>
                    `;
                    appListContainer.appendChild(jobItem);
                });
            } catch (err) {
                console.error('Error in fetchApplications:', err);
                appListContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
            }
        };

        fetchApplications();
    };

    // --- Initial Check ---
    checkAuth();
});