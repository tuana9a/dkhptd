const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Get the file path from the first command-line argument
const filePath = process.argv[2];
const jwt = process.env.JWT;
const baseUrl = process.argv[3] || process.env.BASE_URL || "http://localhost:8080";

if (!filePath) {
  console.error('Usage: node ' + filePath + ' <path_to_file>');
  process.exit(1);
}

// Resolve the absolute path
const absoluteFilePath = path.resolve(filePath);

// Check if the file exists
if (!fs.existsSync(absoluteFilePath)) {
  console.error(`Error: File not found at ${absoluteFilePath}`);
  process.exit(1);
}

// Create a new FormData instance
const formData = new FormData();

// Append the file to the form data.
// 'file' here is the field name that your server expects for the file upload.
// If your server expects a different field name (e.g., 'document'), change 'file' accordingly.
formData.append('file', fs.createReadStream(absoluteFilePath), path.basename(absoluteFilePath));

// Define the target URL
const url = `${baseUrl}/api/class-to-registers/file`;

console.log(`Attempting to upload file: ${absoluteFilePath} to ${url}`);

axios.post(url, formData, {
  headers: {
    ...formData.getHeaders(),
    Authorization: jwt,
  },
  maxContentLength: Infinity, // Important for large files
  maxBodyLength: Infinity,     // Important for large files
})
  .then(response => {
    console.log('File uploaded successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  })
  .catch(error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error uploading file: Server responded with an error');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error uploading file: No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error uploading file:', error.message);
    }
    console.error('Axios config:', error.config);
    process.exit(1);
  });