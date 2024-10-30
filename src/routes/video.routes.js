import { Router } from "express";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
// we have to verify jwt for all the routes in this file
// so, we will use a middleware
router.use(verifyJWT);

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideoDetails)
  .delete(deleteVideo);

export default router;
