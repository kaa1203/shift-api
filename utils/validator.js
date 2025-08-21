import Joi from "joi";

const validator =
  (schema) =>
  (payload, opts = {}) =>
    schema.validate(payload, { abortEarly: true, context: opts });

const registerSchema = Joi.object({
  fullname: Joi.string().trim().required().max(60).messages({
    "any.required": "Fullname is required!",
    "string.max": "Fullname must not exceed {#limit} characters long!",
  }),
  username: Joi.string().trim().required().min(6).max(15).messages({
    "any.required": "Username is required!",
    "string.min": "Username must be at least {#limit} characters long!",
    "string.max": "Username cannot exceed {#limit} characters!",
  }),
  email: Joi.string()
    .trim()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .messages({
      "any.required": "Email is required!",
      "string.email": "Invalid email!",
    }),
  password: Joi.string()
    .trim()
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
    .trim()
    .required()
    .valid("super admin", "admin", "user")
    .messages({
      "any.required": "Account type is required!",
      "any.only": "Account type must be one of: super admin, admin, or user!",
    }),
});

const loginSchema = Joi.object({
  identifier: Joi.required()
    .custom((value, helpers) => {
      if (value.includes("@")) {
        const emailSchema = Joi.string()
          .trim()
          .email({
            minDomainSegments: 2,
            tlds: ["com", "ph", "net"],
          });

        const { error } = emailSchema.validate(value);

        if (error) return helpers.error("string.email", { value });
      } else {
        const userSchema = Joi.string().trim();

        const { error } = userSchema.validate(value);

        if (error) return helpers.error("string.username", { value });
      }

      return value;
    })
    .messages({
      "string.email": "Invalid Email format!",
      "string.username": "Invalid Email or Username!",
      "string.base": "Email or Username must be a string!",
    }),
  password: Joi.string().trim().required(),
});

const emailSchema = Joi.object({
  email: Joi.string()
    .trim()
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
    .trim()
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
    .trim()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password doesn't match",
      "any.required": "Confirm Password is required!",
    }),
});

const updateProfileSchema = Joi.object({
  fullname: Joi.string().trim().max(60).messages({
    "any.required": "Fullname is required!",
    "string.max": "Fullname must not exceed {#limit} characters long!",
  }),
  username: Joi.string().trim().min(6).max(15).messages({
    "any.required": "Username is required!",
    "string.min": "Username must be at least {#limit} characters long!",
    "string.max": "Username cannot exceed {#limit} characters!",
  }),
  email: Joi.string()
    .trim()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .messages({
      "any.required": "Email is required!",
      "string.email": "Invalid email!",
    }),
  accountType: Joi.string()
    .trim()
    .valid("super admin", "admin", "user")
    .messages({
      "any.required": "Account type is required!",
      "any.only": "Account type must be one of: super admin, admin, or user!",
    }),
});

const avatarSchema = Joi.object({ avatarUrl: Joi.string().trim().required() });

const entrySchema = Joi.object({
  entry: Joi.string().trim().max(5000).required().when("$isUpdate", {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  mood: Joi.object({
    label: Joi.string()
      .valid("very sad", "sad", "fine", "happy", "very happy")
      .trim()
      .when("$isUpdate", {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    intensity: Joi.number().min(1).max(5).when("$isUpdate", {
      is: true,
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  }),
  tags: Joi.array().items(Joi.string()),
});

const tagSchema = Joi.object({
  name: Joi.string().min(4).required().trim(),
  color: Joi.string().required().trim(),
  description: Joi.string().min(4).optional().trim(),
});

export const registerValidation = validator(registerSchema);
export const loginValidation = validator(loginSchema);
export const emailValidation = validator(emailSchema);
export const newPasswordValidation = validator(newPasswordSchema);
export const avatarValidation = validator(avatarSchema);
export const updateProfileValidation = validator(updateProfileSchema);
export const entryValidation = validator(entrySchema);
export const tagValidation = validator(tagSchema);
