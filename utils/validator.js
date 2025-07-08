import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: true });

const registerSchema = Joi.object({
  fullname: Joi.string().required().max(60).messages({
    "any.required": "Fullname is required!",
    "string.max": "Fullname must not exceed {#limit} characters long!",
  }),
  username: Joi.string().required().min(6).max(15).messages({
    "any.required": "Username is required!",
    "string.min": "Username must be at least {#limit} characters long!",
    "string.max": "Username cannot exceed {#limit} characters!",
  }),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .messages({
      "any.required": "Email is required!",
      "string.email": "Invalid email!",
    }),
  password: Joi.string()
    .required()
    .min(6)
    .max(64)
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .messages({
      "any.required": "Password is required!",
      "string.min": "Password must be atleast 6 characters long!",
      "string.max": "Password must not exceed {#limit} characters!",
      "string.pattern.base":
        "Password must have atleast one uppercase letter, one number, and one special character!",
    }),
  accountType: Joi.string()
    .required()
    .valid("super admin", "admin", "user")
    .messages({
      "any.required": "Account type is required!",
      "any.only": "Account type must be one of: super admin, admin, or user!",
    }),
});

const loginSchema = Joi.object({
  user: Joi.alternatives().try(
    Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .options({ convert: false })
      .message({ "string.email": "Invalid email!" }),
    Joi.string().min(6).max(15)
  ),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string()
    .required()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .messages({
      "any.required": "Email is required!",
      "string.email": "Invalid email!",
    }),
});

const newPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .min(6)
    .max(64)
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .messages({
      "any.required": "Password is required!",
      "string.min": "Password must be atleast 6 characters long!",
      "string.max": "Password must not exceed {#limit} characters!",
      "string.pattern.base":
        "Password must have atleast one uppercase letter, one number, and one special character!",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password doesn't match",
      "any.required": "Confirm Password is required!",
    }),
});

const avatarSchema = Joi.object({ avatarUrl: Joi.string().required() });

export const registerValidation = validator(registerSchema);
export const loginValidation = validator(loginSchema);
export const emailValidation = validator(emailSchema);
export const newPasswordValidation = validator(newPasswordSchema);
export const avatarValidation = validator(avatarSchema);
