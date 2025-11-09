## Inspiration
As UB students, we find it frustrating circling a parking lot with scarce success in finding a parking spot. We wanted to create an app that solves this problem - we want to be able to check for availabilities from anywhere!

## What it does
This web app shows parking spot availability across campus, estimating how many spots are open using a fine-tuned computer vision model for detecting open parking spaces. 

Our main features are scheduling, which allows users to submit a time in the future that they will be leaving the parking lot, and a "I'm leaving" feature, which is a best effort way a user can signal to a user that they're leaving a parking lot soon(within 5 minutes).

## How we built it
- Frontend: Next.js 15 (app router), React, TypeScript, shadcn/ui components, Tailwind CSS
- Backend: Flask with Blueprint routing, CORS-enabled API endpoints
- Database: Supabase (PostgreSQL) for storing lots, occupancy data, and user schedules
- Computer Vision: Roboflow Inference API with custom parking detection model, OpenCV for frame extraction
- Mapping: Mapbox GL JS with GeoJSON polygon data for parking lot visualization
- Real-time Updates: Background threading for continuous CV processing (5-second intervals), polling-based frontend updates
- Geolocation: Browser Geolocation API with coordinate-based proximity validation
- Video Processing: MP4 video looping with frame-by-frame analysis, temporary file handling for inference
- Background Workers: Three daemon threads (CV analysis, schedule cleanup, timed status reversions)
- Deployment Setup: Python virtual environment, environment variables via dotenv

## Challenges we ran into
- None of the pre-trained models were very good at detecting empty parking spots. One of our team members focused on researching and fine-tuning models to improve the detection system (tested 6 different Roboflow parking detection models - some detected 300 spots while others detected 0-2 spots on the same image)
- Making detection consistent across frames, constantly tweaking Confidence Threshold for the best results.


## Accomplishments that we're proud of
- Built Two Comprehensive Video Processing Systems: Created both a manual interactive detector with pause/resume controls and a fully automated export system for demo video generation
- Detected Real Parking Lot with High Occupancy: Successfully analyzed REAL parking footage


## What we learned
- Computer Vision Model Evaluation: Not all pre-trained models work equally well for the same task
- OpenCV Video Processing at Scale - many different data points
- Threshold Tuning and Post-Processing in CV
- Full stack implementation of computer vision

We learned how to integrate computer vision technology into a web app, simulating real-time feedback.

## What's next for ParkABull
We plan to expand to all parking lots across all UB campuses. 
