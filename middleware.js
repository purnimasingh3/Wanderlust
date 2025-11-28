const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError=require("./utils/ExpressError.js");
const{ listingSchema , reviewSchema }= require("./schema.js");


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        let redirectTo = req.originalUrl;
        if (redirectTo.includes("/reviews")&& 
        redirectTo.includes("_method=DELETE")){
            redirectTo = redirectTo.split("/reviews")[0];
        }
        req.session.redirectUrl = redirectTo;
        req.flash("error","You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async(req,res,next)=>{
    let{ id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        
    }
    next();
};

module.exports.validateListing = (req,res,next)=>{
    let{ error } =listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");// error l andr kai sari details h object k form me in sbko extract krne k liye we can create a variable errmsg in sb error k details k hr element 
        // k msg ko map kr skte h jo hr ek element hai uska msg return kr skte h or jo milega usko ek , k sath join kr skte h .
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
    let{error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) =>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else{
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let{ id , reviewId }= req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};