import db from "../db.server"; // Replace with your actual database import

// [START get-image]
export async function getImage(id) {
  const image = await db.image.findFirst({ where: { id } });

  if (!image) {
    return null;
  }

  return image;
}

export async function getImages(reviewId) {
  const images = await db.image.findMany({
    where: { reviewId },
    orderBy: { id: "desc" },
  });

  if (images.length === 0) return [];

  return images;
}
// [END get-image]

// [START get-image-url]
export function getImageUrl(id) {
  // This function should generate or retrieve the URL for the image.
  // The implementation depends on where and how you store your images.
  // For example, if using cloud storage, generate a URL pointing to the storage location.
  return `https://your-image-storage.com/images/${id}`;
}
// [END get-image-url]

// [START validate-image]
export function validateImage(data) {
  const errors = {};

  if (!data.url) {
    errors.url = "Image URL is required";
  }

  // Add more validation as needed, e.g., checking file type or size

  if (Object.keys(errors).length) {
    return errors;
  }
}
// [END validate-image]

// Add any other functions you need, like updating or deleting images
