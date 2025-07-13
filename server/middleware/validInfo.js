const zod = require("zod");
const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
    const { name, email, password, confirmed_password, location } = req.body;
    function validEmail(userEmail) {
      const emailSchema = zod.string().email();
      const result = emailSchema.safeParse(userEmail);
      return result.success;
      // return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
    function validPassword(userPassword) {
      const passwordSchema = zod.string().min(6);
      const result = passwordSchema.safeParse(userPassword);
      return result.success;
    }
    const deleteUploadedFile = () => {
      if (req.file) {
        const folder = req.params.folder; // e.g., 'users'
        const filePath = path.join(__dirname, '..', 'public', 'images', folder, req.file.filename);

        try {
          fs.unlinkSync(filePath);
          console.log('Deleted invalid uploaded file:', req.file.filename);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    };
  
    if (req.path.includes("/register")) {
      console.log(confirmed_password, password);
      if(confirmed_password !== password){
        deleteUploadedFile();
        return res.status(401).json("Passwords do not match");
      }

      if (![name, email, password, confirmed_password, location].every(Boolean)) {
        deleteUploadedFile();
        return res.status(401).json("Missing Credentials");
      } else if (!validEmail(email)) {
        deleteUploadedFile();
        return res.status(401).json("Invalid Email");
      } else if(!validPassword(password)) {
        deleteUploadedFile();
        return res.status(401).json("Invalid Password");
      }
    } 
    
    else if (req.path === "/login") {
      if (![email, password].every(Boolean)) {
        return res.status(401).json("Missing Credentials");
      } else if (!validEmail(email)) {
        return res.status(401).json("Invalid Email");
      } else if (!validPassword(password)) {
        return res.status(401).json("Invalid Password");
      }
    }
  
    next();
  };