import multer from "multer";

export const multerUploads = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const singleAvatarUpload = multerUploads.single("file");
