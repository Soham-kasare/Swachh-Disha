# Swachh Disha

Digital waste management web app for Vasai-Virar (Citizen, Collector, Area Host, Admin).

## Run in VS Code
1. Open this folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".
   (Camera and GPS need http://localhost or https, so do not just double-click the file.)

## Demo logins
- Admin passcode: admin123
- Area host passcode: host123
- Collectors: 9000000001 (Virar), 9000000002 (Vasai), 9000000003 (Nalasopara group)
- Citizen: register with any 10-digit mobile number

## Notes
- The map uses Leaflet and OpenStreetMap, so it needs internet access.
- City figures come from VVCMC reports supplied by the project team; verify before official use.

## Structure
- index.html
- css/style.css
- js/app.js  (all app logic; data is saved in the browser's localStorage)
- images/logo.png
