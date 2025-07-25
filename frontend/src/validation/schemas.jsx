import { isValidPhoneNumber } from "libphonenumber-js";
import * as Yup from "yup";
export const registerSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  number: Yup.string()
    .required("Phone number is required")
    .test("is-valid-phone", "Phone number is invalid", function (value) {
      return isValidPhoneNumber(value || "");
    }),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  password_confirmation: Yup.string()
    .required("Confirm Password is required")
    .oneOf(
      [Yup.ref("password"), null],
      "Password and Confirm Password doesn't match"
    ),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
});

export const resetPasswordLinkSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
});

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  password_confirmation: Yup.string()
    .required("Confirm password is required")
    .oneOf(
      [Yup.ref("password"), null],
      "Password and Confirm Password doesn't match"
    ),
});

export const verifyEmailSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  otp: Yup.string().required("OTP is required"),
});

export const changePasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  password_confirmation: Yup.string()
    .required("Confirm password is required")
    .oneOf(
      [Yup.ref("password"), null],
      "Password and Confirm Password doesn't match"
    ),
});

export const productSchema = Yup.object({
  productName: Yup.string().required("Product Name is required"),
  productDescription: Yup.string().required("Product Description is required"),
  SKU: Yup.string().required("SKU is required"),
  productPrice: Yup.number()
    .required("Product Price is required")
    .positive("Price must be a positive number")
    .min(0, "Price cannot be negative"),
  category: Yup.string().required("Category is required"),
  productTotalStockQty: Yup.number()
    .required("Total Stock Quantity is required")
    .positive("Stock Quantity must be a positive number")
    .min(0, "Stock Quantity cannot be negative"),
  productImageUrls: Yup.array().min(1, "At least One image is required"),
  keywords: Yup.string()
    .required("Keywords are required")
    .max(200, "Keep keywords under 200 characters"),

  discount: Yup.number()
    .default(0)
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot be more then 100%"),
});

export const categorySchema = Yup.object({
  categoryName: Yup.string().required("Category Name is required"),
  categoryImage: Yup.string().required("Category image is required"),
});

export const addressValidationSchema = Yup.object({
  Address: Yup.string().required("Address is required"),
  DeliveryCharge: Yup.number()
    .required("Delivery charge is required")
    .positive("Delivery charge must be a positive number")
    .typeError("Delivery charge must be a number"),
});

export const SocialLinkValidationSchema = Yup.object({
  socialLinkName: Yup.string().required("Social Link Name is required"),
  socialLink: Yup.string()
    .url("Invalid URL")
    .required("Social Link URL is required"),
});

export const getBannerValidationSchema = (isEdit = false) =>
  Yup.object({
    BannerImage: Yup.mixed()
      .nullable()
      .when([], {
        is: () => !isEdit,
        then: (schema) =>
          schema
            .required("Banner Image is required")
            .test("fileSize", "Image must be under 2MB", (value) =>
              value ? value.size <= 2 * 1024 * 1024 : false
            )
            .test("fileType", "Unsupported image type", (value) =>
              value
                ? ["image/jpeg", "image/png", "image/webp"].includes(value.type)
                : false
            )
            .test(
              "dimensions",
              "Image must be exactly 1200x300 pixels",
              async (file) => {
                if (!file) return false;

                const imageLoaded = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target?.result;
                    img.onload = () => {
                      resolve(img.width === 1200 && img.height === 300);
                    };
                  };
                  reader.readAsDataURL(file);
                });

                return imageLoaded;
              }
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
    productLink: Yup.string()
      .url("Invalid URL")
      .required("Product Link URL is required"),
  });

export const checkoutValidationSchema = Yup.object({
  fullName: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("is-valid-phone", "Phone number is invalid", function (value) {
      return isValidPhoneNumber(value || "");
    }),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zip: Yup.string().required("Zip code is required"),
  address: Yup.object().required("Shipping address is required"),
  paymentMethod: Yup.string().required("Payment method is required"),
  cart: Yup.array(),
});
export const LogoValidationSchema = Yup.object({
  websiteName: Yup.string().required("Website name is required"),
  supportNumber: Yup.string()
    .required("Support number is required")
    .matches(
      /^\+[1-9]\d{7,14}$/,
      "Enter a valid international number (e.g.+614123456781)"
    ),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  address: Yup.string().required("Address is required"),
  tawkToId: Yup.string()
    .matches(/^[a-zA-Z0-9/]+$/, "Invalid Tawk.to ID")
    .nullable(),
  keywords: Yup.string()
    .required("Keywords are required")
    .max(200, "Keep keywords under 200 characters"),
});

export const TermsValidationSchema = Yup.object({
  termsCondition: Yup.string()
    .min(20, "Content must be at least 20 characters")
    .required("Terms & Conditions content is required"),
});
export const PrivacyPolicyValidationSchema = Yup.object({
  privacyPolicy: Yup.string()
    .min(20, "Content must be at least 20 characters")
    .required("Terms & Conditions content is required"),
});
export const ContactValidationSchema = Yup.object().shape({
  contactContent: Yup.string()
    .min(20, "Content must be at least 20 characters")
    .required("Contact content is required"),
  mapEmbedUrl: Yup.string()
    .url("Invalid URL format")
    .required("Map embed URL is required"),
});
export const AboutValidationSchema = Yup.object({
  aboutContent: Yup.string()
    .required("Content is required")
    .min(20, "Content must be at least 20 characters"),
});

export const couponSchema = Yup.object({
  code: Yup.string().required("Coupon code is required"),
  discount: Yup.number()
    .typeError("Discount must be a number")
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%")
    .required("Discount is required"),
  startDate: Yup.date().required("Start date and time is required"),
  expiresAt: Yup.date()
    .min(Yup.ref("startDate"), "Expiry date must be after the start date")
    .required("Expiry date and time is required"),
  maxUses: Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue.trim() === "" ? null : Number(originalValue)
    )
    .min(1, "Must be at least 1")
    .notRequired(),
  maxUsesPerUser: Yup.number()
    .typeError("Max uses per user must be a number")
    .min(1, "Must be at least 1")
    .required("Max uses per user is required"),
  active: Yup.boolean(),
});
