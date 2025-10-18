const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');

// --- Middleware ---
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    next();
};

const isEmployer = (req, res, next) => {
    if (req.session.userRole !== 'employer') {
        return res.status(403).json({ message: 'Access denied. Employers only.' });
    }
    next();
};

const isSeeker = (req, res, next) => {
    if (req.session.userRole !== 'job_seeker') {
        return res.status(403).json({ message: 'Access denied. Job seekers only.' });
    }
    next();
};

// --- Job Routes ---

// GET /api/jobs (Find all jobs, with search)
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.keyword) {
            query.title = { $regex: req.query.keyword, $options: 'i' };
        }
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.jobType) {
            query.jobType = req.query.jobType;
        }

        const jobs = await Job.find(query)
            .populate('postedBy', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/jobs/:id (Get single job details)
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/jobs (Post a new job)
router.post('/', isAuthenticated, isEmployer, async (req, res) => {
    const { title, description, requirements, location, jobType, deadline } = req.body;
    try {
        const newJob = new Job({
            title, description, requirements, location, jobType, deadline,
            postedBy: req.session.userId
        });
        const job = await newJob.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/jobs/:id/apply (Apply for a job)
router.post('/:id/apply', isAuthenticated, isSeeker, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user has already applied
        const hasApplied = job.applications.some(
            app => app.applicant.toString() === req.session.userId
        );
        if (hasApplied) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Add a new application object
        job.applications.push({ applicant: req.session.userId, status: 'Applied' });
        await job.save();
        res.status(200).json({ message: 'Application successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- Dashboard Routes ---

// GET /api/jobs/employer/my-jobs (Employer's posted jobs)
router.get('/employer/my-jobs', isAuthenticated, isEmployer, async (req, res) => {
    try {
        const myJobs = await Job.find({ postedBy: req.session.userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'applications',
                populate: {
                    path: 'applicant',
                    model: 'User',
                    select: 'name email' // Select only the name and email fields
                }
            });
        res.status(200).json(myJobs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/jobs/:jobId/applications/:appId (Update Application Status)
router.put('/:jobId/applications/:appId', isAuthenticated, isEmployer, async (req, res) => {
    const { jobId, appId } = req.params;
    const { status } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const application = job.applications.id(appId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        await job.save();

        res.status(200).json(application);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/jobs/seeker/my-applications (Seeker's applied jobs)
router.get('/seeker/my-applications', isAuthenticated, isSeeker, async (req, res) => {
    try {
        const myApps = await Job.find({ 'applications.applicant': req.session.userId })
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name');
        
        const filteredJobs = myApps.map(job => {
            const myApplication = job.applications.find(
                app => app.applicant.toString() === req.session.userId
            );
            return {
                _id: job._id,
                title: job.title,
                location: job.location,
                postedBy: job.postedBy,
                status: myApplication.status // Add the status
            };
        });

        res.status(200).json(filteredJobs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/jobs/:id (Delete a job)
router.delete('/:id', isAuthenticated, isEmployer, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.postedBy.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'User not authorized to delete this job' });
        }
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;