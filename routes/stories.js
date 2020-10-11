const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Stories");
const User = require("../models/User");

//@desc  Show Add page
//@route get /stories/add
router.get("/add", [ensureAuth], (req, res) => {
  res.render("stories/add");
});

//@desc  show single story
//@route get /stories/:id
router.get("/:id", async (req, res) => {
  try {
    let story = await Story.findOne({ _id: req.params.id })
      .populate("user")
      .lean(); //mush include lean() for handlebar

    if (!story) {
      res.render("error/404");
    } else {
      res.render("stories/story", { story });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//@desc  add storeis
//@route post /stories
router.post("/", [ensureAuth], async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("error/500");
  }
});

//@desc show all stories
//@route get /stories/add
router.get("/", [ensureAuth], async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", { stories });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

//@desc show edit page
//@route get /stories/edit/:id
router.get("/edit/:id", [ensureAuth], async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id }).lean();

  if (!story) {
    res.render("error/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    res.render("stories/edit", {
      story,
    });
  }
});

//@desc  update story
//@route put /stories/:id
router.put("/:id", [ensureAuth], async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) res.redirect("error/404");

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("erro/500");
  }
});

//@desc  delete Story
//@route delete /stories/:id
router.delete("/:id", [ensureAuth], async (req, res) => {
  try {
    await Story.findByIdAndRemove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//@desc  user stories
//@route Get /stories/user/:userId
router.get('/user/:userId', [ensureAuth], async (req, res) => {
    try {
      const stories = await Story.find({
        user: req.params.userId,
        status: 'public'
      }).populate('user')
      .lean();

      res.render('stories/index', {stories});
    } catch (err) {
      console.error(err);
      res.render('error/500');
    }
});

module.exports = router;
