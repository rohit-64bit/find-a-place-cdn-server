const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const port = 8889 || process.env.PORT

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

        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" })

    }

});


app.delete('/delete/:imageUrl', (req, res) => {

    try {

        const imageUrlToDelete = req.params.imageUrl;

        const imagePath = path.join(__dirname, 'uploads', imageUrlToDelete);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            res.status(200).json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Image not found' });
        }

    } catch (error) {

        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" })

    }

});


app.listen(port, () => {
    console.log(`CDN server running at ${port}`);
});