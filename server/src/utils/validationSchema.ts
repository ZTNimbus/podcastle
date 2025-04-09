import { isValidObjectId } from "mongoose";
import * as yup from "yup";

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
