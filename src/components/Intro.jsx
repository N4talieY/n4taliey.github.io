import React from "react";
import "../styles/Intro.css";
import { TypeAnimation } from "react-type-animation";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FadeInSection from "./FadeInSection";
import BreathingTree from "./BreathingTree";

const Intro = () => {
  return (
    <div id="intro">
      <div className="intro-simulation">
        <BreathingTree />
      </div>
      <div className="intro-block">
        <div className="intro-title">
          {"hi, "}
          <span className="intro-name">
            <TypeAnimation
              sequence={["Xinyi"]}
              wrapper="span"
              cursor={false}
              repeat={0}
            />
          </span>
          {" here."}
          <span className="intro-cursor">|</span>
        </div>
        <FadeInSection>
          <div className="intro-desc">
            Software engineer and machine learning researcher building
            intelligent systems. I enjoy turning ambiguous ideas into
            thoughtful, testable products — from early prototypes to reliable
            APIs and complete applications.
          </div>
          <div className="intro-actions">
            <a href="mailto:nataliey@126.com" className="intro-contact">
              <EmailRoundedIcon />
              {" Contact me"}
            </a>
            <a href="/Xinyi_Yang_CV.pdf" className="intro-cv" download>
              <DownloadRoundedIcon />
              {" Download CV"}
            </a>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default Intro;
