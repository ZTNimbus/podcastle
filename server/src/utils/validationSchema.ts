import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import { categories } from "./audioCategories";

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name is too short")
    .max(50, "Name is too long"),

  email: yup.string().email("Invalid email").required("Email is required"),

  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});

export const TokenAndIdVerification = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),

  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;

      return "";
    })
    .required("Invalid user id"),
});

export const ResetPasswordSchema = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),

  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;

      return "";
    })
    .required("Invalid user id"),

  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});

export const SignInValidationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),

  password: yup.string().trim().required("Password is required"),
});

export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  about: yup.string().required("About is required"),
  category: yup
    .string()
    .oneOf(categories, "Invalid category")
    .required("Category is required"),
});

export const NewPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  resId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) return value;
    else return "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Must be public or private")
    .required("Visibility is required"),
});

export const OldPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),

  //Validates audio ID
  item: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) return value;
    else return "";
  }),

  //Validates playlist ID
  id: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) return value;
    else return "";
  }),
  visibility: yup
    .string()
    .oneOf(["public", "private"], "Must be public or private")
    .required("Visibility is required"),
});

export const UpdateHistorySchema = yup.object().shape({
  audio: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;
      else return "";
    })
    .required("Invalid audio id"),

  progress: yup.number().required("Progress is required"),

  date: yup
    .string()
    .transform(function (value) {
      const date = new Date(value);

      if (date instanceof Date) return value;
      return "";
    })
    .required("Invalid date"),
});
