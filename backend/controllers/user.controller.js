import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Profile from "../models/profile.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataToPDF = (profile) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
      const fullPath = `uploads/${outputPath}`;
      const stream = fs.createWriteStream(fullPath);

      doc.pipe(stream);

      // Validate profile.userId exists
      if (!profile.userId) {
        reject(new Error("Profile userId is missing"));
        return;
      }

      // Profile picture (safe check)
      if (profile.userId.profilePicture) {
        const imgPath = profile.userId.profilePicture.startsWith("uploads/")
          ? profile.userId.profilePicture
          : `uploads/${profile.userId.profilePicture}`;

        if (fs.existsSync(imgPath)) {
          try {
            doc.image(imgPath, {
              fit: [100, 100],
              align: "center",
            });
            doc.moveDown();
          } catch (imgError) {
            console.error("Failed to load profile picture:", imgError);
          }
        }
      }

      // Header with name
      doc.fontSize(20).text(profile.userId.name || "N/A", { align: "center" });
      doc.moveDown();

      // Contact Information
      doc.fontSize(14).text("Contact Information", { underline: true });
      doc.fontSize(12).text(`Email: ${profile.userId.email || "N/A"}`);
      doc.text(`Username: ${profile.userId.username || "N/A"}`);
      doc.moveDown();

      // Bio
      doc.fontSize(14).text("Bio", { underline: true });
      doc.fontSize(12).text(profile.bio || "N/A");
      doc.moveDown();

      // Current Position
      doc.fontSize(14).text("Current Position", { underline: true });
      doc.fontSize(12).text(profile.currentPost || "N/A");
      doc.moveDown();

      // Past Work Experience
      doc.fontSize(14).text("Past Work Experience", { underline: true });
      if (profile.pastWork && Array.isArray(profile.pastWork) && profile.pastWork.length > 0) {
        profile.pastWork.forEach((work, index) => {
          doc.fontSize(12).text(`${index + 1}. ${work}`);
        });
      } else {
        doc.fontSize(12).text("N/A");
      }
      doc.moveDown();

      // Education
      doc.fontSize(14).text("Education", { underline: true });
      if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
        profile.education.forEach((edu, index) => {
          doc.fontSize(12).text(`${index + 1}. ${edu}`);
        });
      } else {
        doc.fontSize(12).text("N/A");
      }

      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

//  |----------------------------------------------------------------------|
//  |                          User Registration                           |
//  |----------------------------------------------------------------------|
export const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
    });

    await Profile.create({
      userId: newUser._id,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                          User Login                                  |
//  |----------------------------------------------------------------------|

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                       User Profile Picture Upload                    |
//  |----------------------------------------------------------------------|

export const uploadProfilePicture = async (req, res) => {
  try {
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.profilePicture = req.file.path;
    await user.save();

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                        update User Profile                           |
//  |----------------------------------------------------------------------|

export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const { username, email, name } = req.body;

    if (username || email) {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Username or Email already in use" });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (name) user.name = name;

    await user.save();

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                        get User and Profile                          |
//  |----------------------------------------------------------------------|
export const getUserAndProfile = async (req, res) => {
  try {
    const user = req.user;

    const profile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    ); //.populate --> Replaces userId with selected user fields

    return res.status(200).json({ user, profile });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//  |----------------------------------------------------------------------|
//  |                        update Profile Data                           |
//  |----------------------------------------------------------------------|
export const updateProfileData = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Update simple fields
    if (req.body.bio !== undefined) {
      profile.bio = req.body.bio;
    }
    if (req.body.currentPost !== undefined) {
      profile.currentPost = req.body.currentPost;
    }

    // Update pastWork array if provided
    if (req.body.pastWork !== undefined) {
      if (!Array.isArray(req.body.pastWork)) {
        return res.status(400).json({ message: "pastWork must be an array" });
      }
      profile.pastWork = req.body.pastWork;
    }

    // Update education array if provided
    if (req.body.education !== undefined) {
      if (!Array.isArray(req.body.education)) {
        return res.status(400).json({ message: "education must be an array" });
      }
      profile.education = req.body.education;
    }

    await profile.save();

    return res
      .status(200)
      .json({ message: "Profile data updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
//  |----------------------------------------------------------------------|
//  |                        get all profiles                              |
//  |----------------------------------------------------------------------|

export const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture"
    );
    return res.status(200).json({ profiles });
  } catch (error) {}
};

//  |----------------------------------------------------------------------|
//  |                         download Resume                              |
//  |----------------------------------------------------------------------|

export const downloadProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ userId }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const fileName = await convertUserDataToPDF(profile);
    const filePath = `uploads/${fileName}`;


    return res.download(filePath, "profile.pdf", (err) => {

      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Failed to delete temporary PDF:", unlinkErr);
          }
        });
      }
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
};
