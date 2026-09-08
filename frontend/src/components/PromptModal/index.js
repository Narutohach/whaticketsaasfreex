import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "../../styles/makeStyles";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { i18n } from "../../translate/i18n";
import {
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
    Switch,
    Tooltip
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import QueueSelectSingle from "../../components/QueueSelectSingle";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
    prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
    voice: Yup.string().required("Informe o modo para Voz"),
    max_tokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    // A apiKey é validada no backend: na edição ela pode vir vazia, o que
    // significa manter a chave já cadastrada.
    queueId: Yup.number().required("Informe a fila"),
    max_messages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
    const classes = useStyles();
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const initialState = {
        name: "",
        prompt: "",
        provider: "openai",
        model: "gpt-4o-mini",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        isDefault: false,
        queueId: null,
        maxMessages: 10
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return { ...prevState, ...data };
                });
                setSelectedVoice(data.voice);
            } catch (err) {
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        onClose();
    };

    const handleChangeVoice = (e) => {
        setSelectedVoice(e.target.value);
    };

    const handleSavePrompt = async values => {
        const promptData = { ...values, voice: selectedVoice };
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {promptId
                        ? `${i18n.t("promptModal.title.edit")}`
                        : `${i18n.t("promptModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.name")}
                                    name="name"
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                                <div className={classes.multFieldLine}>
                                    <FormControl fullWidth margin="dense" variant="outlined">
                                        <InputLabel>Provedor de IA</InputLabel>
                                        <Select
                                            label="Provedor de IA"
                                            name="provider"
                                            value={values.provider || "openai"}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                setFieldValue("provider", prov);
                                                setFieldValue("model", prov === "gemini" ? "gemini-3.8-flash" : "gpt-4o-mini");
                                            }}
                                        >
                                            <MenuItem value="openai">OpenAI (ChatGPT)</MenuItem>
                                            <MenuItem value="gemini">Google Gemini</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="dense" variant="outlined">
                                        <InputLabel>Modelo Pré-definido</InputLabel>
                                        <Select
                                            label="Modelo Pré-definido"
                                            value={
                                                (values.provider === "gemini"
                                                    ? ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-2.5-pro", "gemini-3.5-flash-lite"].includes(values.model)
                                                    : ["gpt-4o-mini", "gpt-4o", "gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"].includes(values.model))
                                                    ? values.model
                                                    : "custom"
                                            }
                                            onChange={(e) => {
                                                const selected = e.target.value;
                                                if (selected !== "custom") {
                                                    setFieldValue("model", selected);
                                                } else {
                                                    setFieldValue("model", "");
                                                }
                                            }}
                                        >
                                            {(values.provider === "gemini") ? [
                                                <MenuItem key="gemini-3.8-flash" value="gemini-3.8-flash">Gemini 3.8 Flash (Mais Recente)</MenuItem>,
                                                <MenuItem key="gemini-3.7-flash" value="gemini-3.7-flash">Gemini 3.7 Flash (Estável)</MenuItem>,
                                                <MenuItem key="gemini-2.5-pro" value="gemini-2.5-pro">Gemini 2.5 Pro (Alta Precisão)</MenuItem>,
                                                <MenuItem key="gemini-3.5-flash-lite" value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Econômico)</MenuItem>,
                                                <MenuItem key="custom-gemini" value="custom">Outro Modelo Gemini (Digitar manualmente)</MenuItem>
                                            ] : [
                                                <MenuItem key="gpt-4o-mini" value="gpt-4o-mini">GPT-4o Mini (Recomendado)</MenuItem>,
                                                <MenuItem key="gpt-4o" value="gpt-4o">GPT-4o (Multimodal)</MenuItem>,
                                                <MenuItem key="gpt-5.6-luna" value="gpt-5.6-luna">GPT-5.6 Luna (Econômico)</MenuItem>,
                                                <MenuItem key="gpt-5.6-terra" value="gpt-5.6-terra">GPT-5.6 Terra (Equilibrado)</MenuItem>,
                                                <MenuItem key="gpt-5.6-sol" value="gpt-5.6-sol">GPT-5.6 Sol (Alta Capacidade / Raciocínio)</MenuItem>,
                                                <MenuItem key="custom-openai" value="custom">Outro Modelo OpenAI (Digitar manualmente)</MenuItem>
                                            ]}
                                        </Select>
                                    </FormControl>
                                </div>
                                <Field
                                    as={TextField}
                                    label="Identificador Exato do Modelo de IA"
                                    name="model"
                                    placeholder={values.provider === "gemini" ? "Ex: gemini-3.8-flash, gemini-2.5-pro" : "Ex: gpt-4o-mini, gpt-5.6-terra"}
                                    helperText="Você pode usar qualquer modelo suportado pelo provedor configurado acima."
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.apikey")}
                                        name="apiKey"
                                        type={showApiKey ? 'text' : 'password'}
                                        error={touched.apiKey && Boolean(errors.apiKey)}
                                        placeholder={promptId ? "•••••••• (chave já configurada)" : ""}
                                        helperText={
                                            (touched.apiKey && errors.apiKey) ||
                                            (promptId
                                                ? "Deixe em branco para manter a chave atual."
                                                : "")
                                        }
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleToggleApiKey}>
                                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </FormControl>
                                <Field
                                    as={TextField}
                                    label={i18n.t("promptModal.form.prompt")}
                                    name="prompt"
                                    error={touched.prompt && Boolean(errors.prompt)}
                                    helperText={touched.prompt && errors.prompt}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                    rows={10}
                                    multiline={true}
                                />
                                <QueueSelectSingle />
                                <div className={classes.multFieldLine}>
                                    <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="voice-select-label">{i18n.t("promptModal.form.voice")}</InputLabel>
                                        <Select
                                            id="type-select"
                                            label={i18n.t("promptModal.form.voice")}
                                            labelId="voice-select-label"
                                            name="voice"
                                            value={selectedVoice ?? ""}
                                            onChange={handleChangeVoice}
                                            multiple={false}
                                        >
                                            <MenuItem key={"texto"} value={"texto"}>
                                                Texto
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-FranciscaNeural"} value={"pt-BR-FranciscaNeural"}>
                                                Francisa
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-AntonioNeural"} value={"pt-BR-AntonioNeural"}>
                                                Antônio
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-BrendaNeural"} value={"pt-BR-BrendaNeural"}>
                                                Brenda
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-DonatoNeural"} value={"pt-BR-DonatoNeural"}>
                                                Donato
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-ElzaNeural"} value={"pt-BR-ElzaNeural"}>
                                                Elza
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-FabioNeural"} value={"pt-BR-FabioNeural"}>
                                                Fábio
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-GiovannaNeural"} value={"pt-BR-GiovannaNeural"}>
                                                Giovanna
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-HumbertoNeural"} value={"pt-BR-HumbertoNeural"}>
                                                Humberto
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-JulioNeural"} value={"pt-BR-JulioNeural"}>
                                                Julio
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-LeilaNeural"} value={"pt-BR-LeilaNeural"}>
                                                Leila
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-LeticiaNeural"} value={"pt-BR-LeticiaNeural"}>
                                                Letícia
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-ManuelaNeural"} value={"pt-BR-ManuelaNeural"}>
                                                Manuela
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-NicolauNeural"} value={"pt-BR-NicolauNeural"}>
                                                Nicolau
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-ValerioNeural"} value={"pt-BR-ValerioNeural"}>
                                                Valério
                                            </MenuItem>
                                            <MenuItem key={"pt-BR-YaraNeural"} value={"pt-BR-YaraNeural"}>
                                                Yara
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.voiceKey")}
                                        name="voiceKey"
                                        error={touched.voiceKey && Boolean(errors.voiceKey)}
                                        helperText={touched.voiceKey && errors.voiceKey}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.voiceRegion")}
                                        name="voiceRegion"
                                        error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                                        helperText={touched.voiceRegion && errors.voiceRegion}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </div>
                                
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.temperature")}
                                        name="temperature"
                                        error={touched.temperature && Boolean(errors.temperature)}
                                        helperText={touched.temperature && errors.temperature}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.max_tokens")}
                                        name="maxTokens"
                                        error={touched.maxTokens && Boolean(errors.maxTokens)}
                                        helperText={touched.maxTokens && errors.maxTokens}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.max_messages")}
                                        name="maxMessages"
                                        error={touched.maxMessages && Boolean(errors.maxMessages)}
                                        helperText={touched.maxMessages && errors.maxMessages}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                    />
                                </div>

                                <Tooltip title="Usado quando o ticket não tem fila com IA nem a conexão tem uma IA configurada. Só uma empresa pode ter um prompt padrão.">
                                    <FormControlLabel
                                        control={
                                            <Field
                                                as={Switch}
                                                color="primary"
                                                name="isDefault"
                                                checked={values.isDefault}
                                            />
                                        }
                                        label="Prompt padrão da empresa"
                                    />
                                </Tooltip>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("promptModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {promptId
                                        ? `${i18n.t("promptModal.buttons.okEdit")}`
                                        : `${i18n.t("promptModal.buttons.okAdd")}`}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default PromptModal;
