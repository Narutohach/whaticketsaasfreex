import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { makeStyles } from "../../styles/makeStyles";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import "react-toastify/dist/ReactToastify.css";
import HactoLogo from "../../components/Logo";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
    boxSizing: "border-box",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#080c14",
    position: "relative",
    padding: theme.spacing(3),
  },
  ambientGlowTopLeft: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "650px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.05) 50%, rgba(8, 12, 20, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  ambientGlowBottomRight: {
    position: "absolute",
    bottom: "-15%",
    right: "-10%",
    width: "650px",
    height: "650px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(30, 27, 75, 0.05) 50%, rgba(8, 12, 20, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  authCard: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "420px",
    borderRadius: "24px",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    padding: theme.spacing(5, 4),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 2.5),
    },
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(1),
  },
  authHeader: {
    textAlign: "center",
  },
  authTitle: {
    color: "#f8fafc",
    fontWeight: 800,
    fontSize: "1.65rem",
    letterSpacing: "-0.5px",
  },
  authSub: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: theme.spacing(0.5),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.2),
  },
  input: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "rgba(30, 41, 59, 0.6)",
      color: "#f8fafc",
      transition: "all 0.25s ease",
      "&:hover": {
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#10b981",
          borderWidth: "1px",
        },
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    "& .MuiOutlinedInput-input": {
      padding: "15px 14px",
      fontSize: "0.95rem",
      color: "#f8fafc",
      "&::placeholder": {
        color: "#64748b",
        opacity: 1,
      },
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px rgba(30, 41, 59, 0.95) inset",
        WebkitTextFillColor: "#f8fafc",
        caretColor: "#f8fafc",
        borderRadius: "14px",
        transition: "background-color 5000s ease-in-out 0s",
      },
    },
    "& .MuiInputLabel-outlined": {
      color: "#94a3b8",
      transform: "translate(14px, 16px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
      color: "#34d399",
      fontWeight: 600,
    },
    "& .MuiFormHelperText-root": {
      color: "#f87171",
    },
  },
  submitBtn: {
    padding: "14px 0",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    textTransform: "none",
    letterSpacing: "0.4px",
    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 15px 30px -5px rgba(16, 185, 129, 0.6)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  backLink: {
    color: "#34d399",
    fontWeight: 600,
    fontSize: "0.85rem",
    textDecoration: "none",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#10b981",
      textDecoration: "underline",
    },
  },
  signupWrapper: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.88rem",
  },
  signupLink: {
    color: "#34d399",
    fontWeight: 700,
    marginLeft: theme.spacing(0.6),
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const ForgetPassword = () => {
  const classes = useStyles();
  const history = useHistory();
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showResetPasswordButton, setShowResetPasswordButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(!showAdditionalFields);
    setShowResetPasswordButton(!showAdditionalFields);
  };

  const initialState = { email: "" };

  const [user] = useState(initialState);

  const handleSendEmail = async (values) => {
    const email = values.email;
    try {
      const response = await api.post("/forgetpassword", { email });

      if (response.data.status === 404) {
        toast.error("Email não encontrado");
      } else {
        toast.success(i18n.t("Email enviado com sucesso!"));
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleResetPassword = async (values) => {
    const email = values.email;
    const token = values.token;
    const newPassword = values.newPassword;
    const confirmPassword = values.confirmPassword;

    if (newPassword === confirmPassword) {
      try {
        await api.post("/resetpasswords", {
          email,
          token,
          password: newPassword,
        });
        toast.success(i18n.t("Senha redefinida com sucesso."));
        history.push("/login");
      } catch (err) {
        toastError(err);
      }
    }
  };

  const isResetPasswordButtonClicked = showResetPasswordButton;
  const UserSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    newPassword: isResetPasswordButtonClicked
      ? Yup.string()
          .required("Campo obrigatório")
          .matches(
            passwordRegex,
            "Sua senha precisa ter no mínimo 8 caracteres, sendo uma letra maiúscula, uma minúscula e um número."
          )
      : Yup.string(),
    confirmPassword: Yup.string().when("newPassword", {
      is: (newPassword) => isResetPasswordButtonClicked && newPassword,
      then: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "As senhas não correspondem")
        .required("Campo obrigatório"),
      otherwise: Yup.string(),
    }),
  });

  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.ambientGlowTopLeft} />
      <div className={classes.ambientGlowBottomRight} />

      <Paper elevation={0} className={classes.authCard}>
        <div className={classes.logoContainer}>
          <HactoLogo size="large" />
        </div>

        <div className={classes.authHeader}>
          <Typography className={classes.authTitle} component="h1">
            Redefinir senha
          </Typography>
          <Typography className={classes.authSub}>
            {showAdditionalFields
              ? "Informe o código recebido e sua nova senha"
              : "Informe seu e-mail para receber o código de redefinição"}
          </Typography>
        </div>

        <Formik
          initialValues={{
            email: user.email,
            token: "",
            newPassword: "",
            confirmPassword: "",
          }}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              if (showResetPasswordButton) {
                handleResetPassword(values);
              } else {
                handleSendEmail(values);
                toggleAdditionalFields();
              }
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors }) => (
            <Form className={classes.form}>
              <Field
                as={TextField}
                variant="outlined"
                fullWidth
                id="email"
                label={i18n.t("signup.form.email") || "E-mail"}
                name="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                autoComplete="email"
                required
                className={classes.input}
              />

              {showAdditionalFields && (
                <>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="token"
                    label="Código de Verificação"
                    name="token"
                    error={touched.token && Boolean(errors.token)}
                    helperText={touched.token && errors.token}
                    autoComplete="off"
                    required
                    className={classes.input}
                  />
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    label="Nova senha"
                    name="newPassword"
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    autoComplete="new-password"
                    required
                    className={classes.input}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="alternar visibilidade da senha"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                            style={{ color: "#64748b" }}
                          >
                            {showPassword ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    label="Confirme a senha"
                    name="confirmPassword"
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    autoComplete="new-password"
                    required
                    className={classes.input}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="alternar visibilidade da confirmação de senha"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            size="small"
                            style={{ color: "#64748b" }}
                          >
                            {showConfirmPassword ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.submitBtn}
              >
                {showResetPasswordButton ? "Redefinir Senha" : "Enviar Email"}
              </Button>

              <Grid container justifyContent="space-between">
                <Grid>
                  <Link component={RouterLink} to="/login" className={classes.backLink}>
                    Voltar ao login
                  </Link>
                </Grid>
                <Grid>
                  <Link component={RouterLink} to="/signup" className={classes.backLink}>
                    Criar conta
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </div>
  );
};

export default ForgetPassword;
