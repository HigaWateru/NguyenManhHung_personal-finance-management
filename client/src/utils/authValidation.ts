export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof Omit<LoginFormValues, "rememberMe">, string>>;
export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string) => {
  if (!email.trim()) {
    return "Email không được để trống.";
  }

  if (!emailPattern.test(email)) {
    return "Email không đúng định dạng.";
  }

  return "";
};

export const validatePassword = (password: string) => {
  if (!password) {
    return "Mật khẩu không được để trống.";
  }

  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }

  return "";
};

export const validateLoginForm = (values: LoginFormValues) => {
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};

export const validateRegisterForm = (values: RegisterFormValues) => {
  const errors: RegisterFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Họ tên không được để trống.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Họ tên phải có ít nhất 2 ký tự.";
  }

  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};