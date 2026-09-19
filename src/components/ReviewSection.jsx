import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/react";
import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "../services/reviewServices";

import { getUserOrders } from "../services/orderServices";

function ReviewSection({ productId }) {
  const { user, isLoaded } = useUser();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const data = await getProductReviews(productId);

        setReviews(data);

        if (user) {
          const userReview = data.find((review) => review.userId === user.id);

          setExistingReview(userReview || null);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkPurchase = async () => {
      try {
        const orders = await getUserOrders(user.id);

        const purchased = orders.some((order) =>
          order.items.some(
            (item) => String(item.productId) === String(productId),
          ),
        );

        setHasPurchased(purchased);
      } catch (error) {
        console.error("Failed to check purchase history:", error);
      }
    };

    checkPurchase();
  }, [user, isLoaded, productId]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("User is not logged in");
      return;
    }

    if (existingReview) {
      alert("You have already reviewed this product.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);

      const newReview = {
        productId: String(productId),
        userId: user.id,
        userName: user.fullName || user.firstName || "Anonymous",
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log("Submitting review:", newReview);

      await createReview(newReview);

      // Fetch reviews again from JSON Server
      const updatedReviews = await getProductReviews(productId);

      setReviews(updatedReviews);
      toast.success("Review submitted successfully.");

      toast.success("Review submitted successfully.");

      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Failed to create review:", error);

      console.error("Response:", error.response?.data);

      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setEditRating(existingReview.rating);
    setEditComment(existingReview.comment);
    setEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (editRating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!editComment.trim()) {
      alert("Please write a review.");
      return;
    }

    try {
      setUpdating(true);

      const updatedReview = await updateReview(existingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === updatedReview.id ? updatedReview : review,
        ),
      );

      setExistingReview(updatedReview);
      setEditing(false);

      toast.success("Review updated successfully.");
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));

      setExistingReview(null);
      toast.success("Review deleted successfully.");
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review.");
    }
  };

  if (!isLoaded || loading) {
    return (
      <section className="mt-12 border-t pt-10">
        <p className="text-muted-foreground">Loading reviews...</p>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t pt-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-current" />

            <span className="font-semibold">{averageRating}</span>
          </div>

          <span className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Write Review */}
      {user && hasPurchased && !existingReview && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border p-5 sm:p-6"
        >
          <h3 className="text-lg font-semibold">Write a Review</h3>

          {/* Rating */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">Your Rating</p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-md p-1 transition hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= rating ? "fill-current" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mt-5">
            <Textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {user && existingReview && (
        <div className="mb-10 rounded-2xl border p-5">
          <p className="font-medium">You have already reviewed this product.</p>

          <p className="mt-1 text-sm text-muted-foreground">
            You can edit your review below.
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-5">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{review.userName}</p>

                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= review.rating ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.userId === user?.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="rounded-full"
                    >
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this review?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            This will permanently delete your review and cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Review</AlertDialogCancel>

                          <AlertDialogAction
                            className="text-red-500 bg-white shadow-lg hover:bg-red-500 hover:text-white"
                            onClick={() => handleDelete(review.id)}
                          >
                            Delete Review
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              {review.userId === user?.id && editing ? (
                <form onSubmit={handleUpdate} className="mt-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditRating(value)}
                        className="rounded-md p-1 transition hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            value <= editRating ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <Textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    className="mt-3"
                  />

                  <div className="mt-3 flex gap-2">
                    <Button
                      type="submit"
                      disabled={updating}
                      className="rounded-full"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
