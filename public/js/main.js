document.addEventListener('DOMContentLoaded', () => {
    const jobListingsContainer = document.getElementById('job-listings-container');
    const searchForm = document.getElementById('search-form');

    // Function to fetch and display jobs
    const fetchJobs = async (searchParams = {}) => {
        try {
            // Build query string
            const query = new URLSearchParams(searchParams).toString();
            const res = await fetch(`https://job-portal-7fep.onrender.com/api/jobs?${query}`);
            
            if (!res.ok) {
                throw new Error('Error fetching jobs');
            }
            const jobs = await res.json();
            
            renderJobs(jobs);
        } catch (err) {
            console.error(err);
            jobListingsContainer.innerHTML = '<p>Error loading jobs. Please try again.</p>';
        }
    };

    // Function to render jobs to the DOM
    const renderJobs = (jobs) => {
        jobListingsContainer.innerHTML = ''; // Clear existing
        if (jobs.length === 0) {
            jobListingsContainer.innerHTML = '<p>No jobs found matching your criteria.</p>';
            return;
        }

        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            
            const postDate = new Date(job.createdAt).toLocaleDateString();

            jobCard.innerHTML = `
                <h2><a href="/job-details.html?id=${job._id}">${job.title}</a></h2>
                <div class="job-card-meta">
                    <span>${job.postedBy.name}</span>
                    <span>${job.location}</span>
                    <span>${job.jobType}</span>
                </div>
                <p>${job.description.substring(0, 150)}...</p>
                <p><em>Posted on: ${postDate}</em></p>
            `;
            jobListingsContainer.appendChild(jobCard);
        });
    };

    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const params = {
            keyword: document.getElementById('search-keyword').value,
            location: document.getElementById('search-location').value,
            jobType: document.getElementById('search-jobType').value
        };

        // Filter out empty params
        const searchParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v)
        );
        
        fetchJobs(searchParams);
    });

    // Initial fetch of all jobs
    fetchJobs();
});