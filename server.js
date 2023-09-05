const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

app.use(express.static('uploads'));
app.use(cors());

app.get('/', (req, res) => {
    res.send('CDN Server is running');
});

// Configure Multer to save files to a specified folder

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext + ".jpeg");
    },
});

const upload = multer({ storage });

// Route for handling file uploads
app.post('/upload', upload.array('images'), (req, res) => {

    try {

        // Generate URLs for the uploaded files
        const uploadedUrls = req.files.map((file) => {
            return `${req.protocol}://${req.get('host')}/${file.filename}`;
        });

        // Send a JSON response with success and uploaded URLs
        res.status(200).json({ success: true, urls: uploadedUrls });

    } catch (error) {

        console.log(error);

    }

});


app.delete('/delete/:imageUrl', (req, res) => {
    const imageUrlToDelete = req.params.imageUrl;

    // Implement the logic to delete the image here
    // You can use the `fs` module to remove the file from the "uploads" folder

    // Check if the image exists and delete it
    const imagePath = path.join(__dirname, 'uploads', imageUrlToDelete);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Image not found' });
    }
});


app.listen(8889, () => {
    console.log('CDN server running at 8889');
});