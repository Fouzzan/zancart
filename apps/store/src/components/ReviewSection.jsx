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
import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "../services/reviewServices";
import { getUserOrders } from "../services/orderServices";

function ReviewSection({ productId }) {
  const { user, isLoading } = useAuthContext();

  // Prefer the legacy userId when available to preserve existing records.
  const userId = user?.userId || user?.id || null;
  const userName = user?.name || user?.firstName || "Anonymous";

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

  // Fetch reviews and identify the current user's review.
  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      try {
        setLoading(true);

        const data = await getProductReviews(productId);

        if (cancelled) return;

        setReviews(data);

        const userReview = userId
          ? data.find((review) => String(review.userId) === String(userId))
          : null;

        setExistingReview(userReview || null);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        if (!cancelled) {
          toast.error("Failed to load product reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [productId, userId]);

  // Check whether the current user purchased this product.
  useEffect(() => {
    let cancelled = false;

    async function checkPurchase() {
      setHasPurchased(false);

      if (isLoading || !userId) return;

      try {
        const orders = await getUserOrders(userId);

        if (cancelled) return;

        const purchased = orders.some((order) =>
          (order.items || []).some(
            (item) => String(item.productId) === String(productId),
          ),
        );

        setHasPurchased(purchased);
      } catch (error) {
        console.error("Failed to check purchase history:", error);
      }
    }

    checkPurchase();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoading, productId]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0,
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading || !userId) {
      toast.error("Please log in to submit a review.");
      return;
    }

    if (!hasPurchased) {
      toast.error("You can review products you have purchased.");
      return;
    }

    if (existingReview) {
      toast.error("You have already reviewed this product.");
      return;
    }

    if (rating < 1 || rating > 5) {
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
        userId,
        userName,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      const createdReview = await createReview(newReview);

      setReviews((previous) => [...previous, createdReview]);
      setExistingReview(createdReview);
      setRating(0);
      setComment("");

      toast.success("Review submitted successfully.");
    } catch (error) {
      console.error("Failed to create review:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (!existingReview) return;

    setEditRating(existingReview.rating);
    setEditComment(existingReview.comment);
    setEditing(true);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating.");
      return;
    }

    if (!editComment.trim()) {
      toast.error("Please write a review.");
      return;
    }

    try {
      setUpdating(true);

      const updatedReview = await updateReview(existingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });

      setReviews((previous) =>
        previous.map((review) =>
          String(review.id) === String(updatedReview.id)
            ? updatedReview
            : review,
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

      setReviews((previous) =>
        previous.filter((review) => String(review.id) !== String(reviewId)),
      );

      setExistingReview(null);
      setEditing(false);

      toast.success("Review deleted successfully.");
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review.");
    }
  };

  if (isLoading || loading) {
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

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">Your Rating</p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} out of 5`}
                  aria-pressed={value === rating}
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

          <div className="mt-5">
            <Textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={2000}
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
          reviews.map((review) => {
            const isOwnReview =
              Boolean(userId) && String(review.userId) === String(userId);

            return (
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

                  {isOwnReview && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
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
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete review"
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
                              This will permanently delete your review and
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Review</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-white text-red-500 shadow-lg hover:bg-red-500 hover:text-white"
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

                {isOwnReview && editing ? (
                  <form onSubmit={handleUpdate} className="mt-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-label={`Change rating to ${value} out of 5`}
                          aria-pressed={value === editRating}
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

                    <Textarea
                      value={editComment}
                      onChange={(event) => setEditComment(event.target.value)}
                      rows={4}
                      maxLength={2000}
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
            );
          })
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
