document.addEventListener('DOMContentLoaded', () => {
    const detailsContainer = document.getElementById('job-details-container');
    const applyContainer = document.getElementById('job-apply-container');
    const applyBtn = document.getElementById('apply-btn');
    const applyMessage = document.getElementById('apply-message');

    // Get job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId) {
        detailsContainer.innerHTML = '<h1>Job not found</h1>';
        return;
    }

    // Fetch job details
    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) {
                throw new Error('Job not found');
            }
            const job = await res.json();
            renderJobDetails(job);
        } catch (err) {
            detailsContainer.innerHTML = `<h1>${err.message}</h1>`;
            applyContainer.style.display = 'none';
        }
    };

    const renderJobDetails = (job) => {
        const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A';
        detailsContainer.innerHTML = `
            <h1>${job.title}</h1>
            <div class="job-meta">
                <span><strong>Employer:</strong> ${job.postedBy.name}</span>
                <span><strong>Location:</strong> ${job.location}</span>
                <span><strong>Type:</strong> ${job.jobType}</span>
            </div>
            <h3>Job Description</h3>
            <p>${job.description}</p>
            
            <h3>Requirements</h3>
            <p>${job.requirements ? job.requirements : 'N/A'}</p>
            
            <p><strong>Application Deadline:</strong> ${deadline}</p>
        `;
    };

    // Handle job application
    applyBtn.addEventListener('click', async () => {
        applyBtn.disabled = true;
        applyMessage.textContent = 'Submitting application...';
        applyMessage.className = '';

        try {
            const res = await fetch(`/api/jobs/${jobId}/apply`, {
                method: 'POST'
            });

            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('You must be logged in as a Job Seeker to apply.');
                }
                throw new Error(data.message || 'Application failed');
            }

            applyMessage.textContent = 'Application successful!';
            applyMessage.className = 'success';
            applyBtn.textContent = 'Applied';
        } catch (err) {
            applyMessage.textContent = err.message;
            applyBtn.disabled = false;
        }
    });
    
    // Check user role to show/hide apply button
    const checkUserRole = async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const user = await res.json();
            if (user.role === 'job_seeker') {
                applyContainer.style.display = 'block';
            }
        }
    };

    fetchJobDetails();
    checkUserRole();
});