const express = require("express");
const router = express.Router({mergeParams: true});
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,  isReviewAuthor } = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");

function asyncWrap(fn) {
    return function (req,res,next) {
        fn(req,res,next).catch((err) => next(err));
    };
}

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new Error(errMsg));
    } else {
        next();
    }
};

// reviews
// post route
router.post("/",
    isLoggedIn,
    (req, res, next) => {
        console.log(req.body); // Debug output
        next();
    },
    validateReview,
    asyncWrap(reviewController.createReview)
);

// delete reviews route
router.delete("/:reviewId",isLoggedIn,
     isReviewAuthor, 
     asyncWrap(reviewController.destoryReview));

module.exports = router;
