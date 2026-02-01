<h1 align="center">📊 MERN Excel Analytics</h1>
<h3 align="center">Excel File Data Analytics Web Application using MERN Stack</h3>

<p align="center">
  A full-stack web application built with the MERN stack that allows users to upload Excel / CSV files,
  process data, and visualize analytics in meaningful charts and tables.
</p>

<hr/>

<h2>🚀 Features</h2>

<ul>
  <li>Upload Excel (.xlsx) or CSV files</li>
  <li>Server-side parsing and validation of data</li>
  <li>Display analytics in tables or charts</li>
  <li>Interactive data visualization</li>
  <li>Responsive UI built with React</li>
  <li>REST API built with Express & MongoDB</li>
</ul>

<hr/>

<h2>🧠 Tech Stack</h2>

<table>
  <tr>
    <th align="left">Component</th>
    <th align="left">Technology</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>React.js, CSS / Tailwind (or Bootstrap)</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Node.js, Express.js</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>MongoDB, Mongoose</td>
  </tr>
  <tr>
    <td>Excel Parsing</td>
    <td>SheetJS (xlsx), CSV parsing library</td>
  </tr>
  <tr>
    <td>Charts & Visualization</td>
    <td>Chart.js / Recharts / D3.js</td>
  </tr>
</table>

<hr/>

<h2>📁 Project Structure</h2>

<pre>
MERN-excel-analytics-/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── uploads/ (Excel files saved here)
├── .env
└── README.md
</pre>

<p>
This clear separation between frontend and backend gives you modular
control over APIs, UI, and data processing.
</p>

<hr/>

<h2>⚙️ Installation & Setup</h2>

<h3>1️⃣ Clone the Repository</h3>

<pre>
git clone https://github.com/sumanth965/MERN-excel-analytics-.git
cd MERN-excel-analytics-
</pre>

<h3>2️⃣ Backend Setup</h3>

<pre>
cd backend
npm install
</pre>

<p>Create a <code>.env</code> file in the backend folder and add:</p>

<pre>
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
</pre>

<p>Start the backend server:</p>

<pre>
npm run dev
</pre>

<h3>3️⃣ Frontend Setup</h3>

<pre>
cd frontend
npm install
npm start
</pre>

<hr/>

<h2>📊 Key Functionalities</h2>

<ul>
  <li><b>Upload Excel/CSV:</b> Drag & drop or select file from system</li>
  <li><b>Data Preview:</b> View uploaded data in the browser</li>
  <li><b>Interactive Analytics:</b> Charts, graphs, and tables generated from data</li>
  <li><b>Download Processed Output:</b> Export analytics or filtered results</li>
</ul>

<hr/>

<h2>📜 License</h2>
<p>This project is licensed under the <strong>MIT License</strong>.</p>

<hr/>

<h2>👨‍💻 Author</h2>
<p>
<strong>Sumanth</strong><br/>
GitHub: 
<a href="https://github.com/sumanth965" target="_blank">
  https://github.com/sumanth965
</a>
</p>

<p align="center">
⭐ If you enjoy this project, don’t forget to give it a star!
</p>
