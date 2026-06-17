const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfilg.js");
const upload = multer({storage});

function asyncWrap(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
}

const validateListing = (req, res, next) => {
    console.log(req.body); // Debug

    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new Error(errMsg));
    } else {
        next();
    }
};

// index + create
router.route("/")
    .get(asyncWrap(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),

        (req, res, next) => {
            console.log("FILE =", req.file);
            console.log("BODY =", req.body);
            next();
        },

        validateListing,
        asyncWrap(listingController.createListing)
    );

// new form
router.get("/new", isLoggedIn, listingController.renderNewFrom);

//search route
router.get("/search", async(req,res) => {
    let searchText = req.query.q;
    const listings = await Listing.find(
        {
            $or: [
                { country: new RegExp(searchText, "i") },
                { location: new RegExp(searchText, "i") }
            ]
        }
    );
    res.render("listings/search", { listings });
});

// show + update + delete
router.route("/:id")
    .get(asyncWrap(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        asyncWrap(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        asyncWrap(listingController.destoryListing)
    );

// edit form
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    asyncWrap(listingController.renderEdit)
);

module.exports = router;