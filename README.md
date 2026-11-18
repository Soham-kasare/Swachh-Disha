# Swachh-Disha
♻️ Swachh Disha

आपला परिसर, आपली जबाबदारी! स्वच्छ वसई-विरार, सुंदर वसई-विरार!

Swachh Disha is a web-based digital waste management platform for the Vasai-Virar region. It connects citizens, area hosts (officials), garbage collectors and administrators on a single platform, so garbage complaints are reported, assigned, cleaned and verified with transparent, geo-tagged photo proof.

Status: Working front-end prototype. Data is stored in the browser (localStorage). A backend is planned (see Roadmap).

✨ Features
Four role-based interfaces
Role	What they can do
Citizen	Register with name, mobile number and area. Report garbage with a live camera photo (geo-tagged and time-stamped). Track complaint status with a 20-minute response timer. See before/after photos. Rate collectors. Earn Green Points.
Garbage Collector	Register and receive a unique collector ID (e.g. SDC-1004). Choose vehicle/equipment type. Work as an individual or in a group. Start jobs, request extra time (reason + photo proof), upload completion proof, raise complaints, view profile and ratings.
Area Host	See complaints for their area by area code only (no citizen names). Assign or reassign collectors. Approve or decline extra-time requests. View collectors in the area.
Admin / Operator	Dashboard with live statistics and zone-wise inspection. Filter all complaints. Create collection groups, add or remove members. View all users.
Core system rules
📷 Live camera only: no gallery uploads, to prevent fake complaints.
📍 Geo-tag and timestamp stamped on every photo.
⏱️ 15–20 minute response target with a live countdown and overdue flag.
🤖 Auto-assignment: a new complaint goes to the collector in that area with the fewest open jobs.
✅ Image verification: compares complaint and completion photos (location check and scene-change score) before a job is marked cleaned. It also flags duplicate complaints.
🔒 Privacy: officials see area codes, not citizen names.
⭐ Ratings and feedback from citizens on completed work.
Extra features
Green Points rewards for citizens
Ward cleanliness leaderboard
Live Vasai-Virar map (OpenStreetMap + Leaflet) with zone counts, complaint pins and the dumping site
City data page: waste quantities, composition, fleet strength (675 units), administration and contracts
App intro slides and small, subtle animations
🛠️ Tech stack
HTML, CSS, vanilla JavaScript (no build step)
Leaflet 1.9.4 and OpenStreetMap tiles
Browser APIs: getUserMedia (camera), Geolocation, localStorage
Google Fonts (Mukta)
🚀 Run locally
Clone or download this repository.
Open the folder in VS Code.
Install the Live Server extension.
Right-click index.html → Open with Live Server.

Camera and GPS only work on http://localhost or https, so do not open index.html by double-clicking it. The map needs an internet connection.

Demo logins
Role	How to sign in
Citizen	Register with any 10-digit mobile number
Collector	9000000001 (Virar), 9000000002 (Vasai), 9000000003 (Nalasopara, group) or register a new one
Area Host	Any mobile number + passcode host123
Admin	Any mobile number + passcode admin123

If the camera is blocked, use the "Use demo photo" button to test the full flow. Demo passcodes are for the prototype only.

📁 Project structure
swacha-disha/
├── index.html
├── css/style.css
├── js/app.js        # all app logic and role interfaces
├── images/logo.png
└── README.md
📊 Data used

City figures shown in the app come from VVCMC published reports and the Environmental Status Report, as provided by the project team:

~686 TPD solid waste collected (about 60% wet / 40% dry)
~120 TPD C&D waste, ~60 tonnes/month e-waste
73–85% door-to-door coverage across 9 Prabhag Samitis (Wards A–I)
Fleet of 675 collection, transport and cleaning units
Gokhiware / Bhoidapada dumping site with biomining and remediation

Map positions of zones and the dumping site are approximate. Please verify all figures before official use.

⚠️ Current limitations
Data is stored per browser, so users do not share complaints yet.
Image verification is a lightweight image-comparison check, not a trained AI model.
Login is simplified for demonstration (no OTP or secure authentication).
Ward names (A–I) are not yet mapped; areas are used instead.
🗺️ Roadmap
[ ] Backend and shared database (Node.js/Firebase/Supabase)
[ ] OTP-based login and secure role permissions
[ ] Trained AI model for fake-photo and cleanliness detection
[ ] Push/SMS notifications
[ ] Ward A–I mapping with official boundaries
[ ] Marathi / Hindi / English language switch
[ ] Route optimisation for collectors and hotspot prediction
[ ] Community clean-up drives
👤 Author

Kasare Soham Sanjay Second-year BSc Computer Science, St. Wilfred's College, Mumbai University

📄 License

Add a license of your choice (for example MIT) before publishing.
