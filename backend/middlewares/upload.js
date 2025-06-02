import multer from "multer";

// Set up storage engine
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({ storage: storage });

export default upload;
