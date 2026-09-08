import React, { useRef, useEffect, useState } from "react";
import { makeStyles } from "../../styles/makeStyles";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const LS_NAME = "audioMessageRate";

const useStyles = makeStyles((theme) => ({
  audioPlayerRoot: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.75)" : "rgba(241, 245, 249, 0.95)",
    border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    padding: "6px 12px",
    minWidth: 260,
    maxWidth: 340,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    backdropFilter: "blur(8px)",
    gap: 8,
    margin: "4px 0",
  },
  playButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#ffffff",
    width: 38,
    height: 38,
    padding: 6,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.35)",
  },
  trackContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: 3,
  },
  waveformRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    height: 20,
    cursor: "pointer",
  },
  slider: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    accentColor: theme.palette.primary.main,
    cursor: "pointer",
    outline: "none",
  },
  timeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: "0.72rem",
    fontWeight: 500,
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
  },
  rateButton: {
    minWidth: 38,
    height: 24,
    padding: "2px 6px",
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: 12,
    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    color: theme.palette.mode === "dark" ? "#e2e8f0" : "#334155",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "#ffffff",
    },
  },
}));

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const AudioPlayerCustom = ({ url }) => {
  const classes = useStyles();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRate, setAudioRate] = useState(
    parseFloat(localStorage.getItem(LS_NAME) || "1")
  );

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const getSourceUrl = () => {
    let sourceUrl = url;
    if (isIOS && sourceUrl && sourceUrl.endsWith(".ogg")) {
      sourceUrl = sourceUrl.replace(".ogg", ".mp3");
    }
    return sourceUrl;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioRate;
      localStorage.setItem(LS_NAME, audioRate.toString());
    }
  }, [audioRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Audio playback error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleRate = () => {
    let newRate = 1;
    if (audioRate === 1) newRate = 1.5;
    else if (audioRate === 1.5) newRate = 2;
    else if (audioRate === 2) newRate = 1;
    else newRate = 1;

    setAudioRate(newRate);
  };

  return (
    <div className={classes.audioPlayerRoot}>
      <audio
        ref={audioRef}
        src={getSourceUrl()}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <IconButton
        className={classes.playButton}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>

      <div className={classes.trackContainer}>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className={classes.slider}
        />
        <div className={classes.timeRow}>
          <Typography className={classes.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </div>
      </div>

      <Button
        className={classes.rateButton}
        size="small"
        onClick={toggleRate}
        title="Velocidade de reprodução"
      >
        {audioRate}x
      </Button>
    </div>
  );
};

export default AudioPlayerCustom;
