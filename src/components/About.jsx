import React from "react";
import "../styles/About.css";
import FadeInSection from "./FadeInSection";

const About = () => {
  return (
    <div id="about">
      <FadeInSection>
        <div className="section-header ">
          <span className="section-title">/ about me</span>
        </div>

        <div className="about-content">
          <div className="about-description">
            <p>
              Hi — I'm <b>Xinyi Yang</b>. I have completed a BSc in Information
              and Computing Science at Xi'an Jiaotong-Liverpool University.
              {/*In January 2027, I will begin an MS in*/}
              {/*Electrical and Computer Engineering at Carnegie Mellon University.*/}
            </p>
            <p>
              My experience spans LLM application engineering, AI product
              development, software automation, multimodal physiological signal
              analysis, and full-stack development.
            </p>

            <div className="about-skills">
              <b>Core skills</b>
              <p>Python · Java · C/C++ · C# · JavaScript · SQL · MATLAB · LLM pipelines · Machine learning · Unity · Spring Boot</p>
              <b>Languages</b>
              <p>Chinese (native) · English (proficient) · Spanish (fluent)</p>
            </div>

            <div className="contact-block">
              <div><b>Contact</b></div>
              <div className="muted">Tel: +86 15706207509 | Email: <a href="mailto:nataliey@126.com">nataliey@126.com</a></div>
              <div className="muted">GitHub: <a href="https://github.com/N4talieY" target="_blank" rel="noreferrer">github.com/N4talieY</a></div>
            </div>
          </div>

        </div>
      </FadeInSection>
    </div>
  );
};

export default About;
