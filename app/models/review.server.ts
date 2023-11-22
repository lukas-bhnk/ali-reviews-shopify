import db from "../db.server"; // Replace with your actual database import

// [START get-review]
export async function getReview(id) {
  const review = await db.review.findUnique({ where: { id } });

  if (!review) {
    return null;
  }

  return review;
}

export async function getReviews(productId) {
  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });

  if (reviews.length === 0) return [];

  return reviews;
}
// [END get-review]

// [START update-review]
export async function updateReview(id, updateData) {
  const updatedReview = await db.review.update({
    where: { id },
    data: updateData,
  });

  return updatedReview;
}
// [END update-review]

// [START delete-review]
export async function deleteReview(id) {
  await db.review.delete({ where: { id } });
}
// [END delete-review]

// [START validate-review]
export function validateReview(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.content) {
    errors.content = "Content is required";
  }

  // Add more validation as needed

  if (Object.keys(errors).length) {
    return errors;
  }
}
// [END validate-review]

// You can add more functions as needed for your application
