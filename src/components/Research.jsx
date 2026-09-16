import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import FadeInSection from "./FadeInSection";
import "../styles/Research.css";

function TabPanel(props) {
  const { children, value, index, isMobile, ...other } = props;
  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={isMobile ? `full-width-tabpanel-${index}` : `vertical-tabpanel-${index}`}
          aria-labelledby={isMobile ? `full-width-tab-${index}` : `vertical-tab-${index}`}
          {...other}
      >
        {value === index && (
            <Box className="tab-panel-content">
              <Typography component="div">{children}</Typography>
            </Box>
        )}
      </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  isMobile: PropTypes.bool
};

function a11yProps(index, isMobile) {
  return {
    id: (isMobile ? "full-width-tab-" : "vertical-tab-") + index,
    "aria-controls": (isMobile ? "full-width-tabpanel-" : "vertical-tabpanel-") + index,
  };
}

const Research = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const researchItems = {
    "VR Stress Monitoring": {
      title: "Multimodal stress monitoring based on EDA and EEG signal analysis in a VR environment",
      role: "Researcher",
      supervisor: "Prof. Yue Li",
      date: "2025.06 - Present",
      bullets: [
        "Designed a multimodal stress-detection framework integrating Shimmer3 EDA and Muse2 EEG signals in VR",
        "Developed Unity tasks with pointing, grabbing, movement, dynamic objects, cognitive load, and time pressure",
        "Synchronized physiological and behavioral data, extracted EDA/EEG features, and evaluated machine-learning classifiers",
        "Conducted subject experiments and analyzed individual differences for affective-computing research",
      ],
    },
    "Learner Engagement": {
      title: "Mindful Monitoring: Detecting Learner Engagement with Wearable Technology",
      role: "Researcher",
      supervisor: "Dr. Erick Purwanto",
      date: "2023.12 - 2024.12",
      bullets: [
        "Processed a multimodal EEG and eye-tracking dataset from 51 participants and compared classical ML and deep-learning models",
        "Proposed PerformNet, a 1D-CNN architecture that captures spatial-temporal dynamics across the full signal sequence",
        "Designed four individualized thresholding methods to account for personal differences in learner performance",
      ],
    },
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
      <div id="research">
        <FadeInSection>
          <div className="section-header ">
            <span className="section-title">/ research</span>
          </div>

          <Box className="research-container">
            <Tabs
                orientation={!isMobile ? "vertical" : "horizontal"}
                variant="scrollable"
                scrollButtons="auto"
                value={value}
                onChange={handleChange}
                className="research-tabs"
            >
              {Object.keys(researchItems).map((key, i) => (
                  <Tab
                      key={i}
                      label={key}
                      {...a11yProps(i, isMobile)}
                      className="research-tab"
                  />
              ))}
            </Tabs>
            <Box className="research-panel">
              {Object.keys(researchItems).map((key, i) => (
                  <TabPanel key={i} value={value} index={i} isMobile={isMobile}>
                    <div className="research-job-title">
                      {researchItems[key]["title"]}
                    </div>
                    <div className="research-duration">
                      {researchItems[key]["role"]} (Supervisor: {researchItems[key]["supervisor"]}) | {researchItems[key]["date"]}
                    </div>
                    <ul className="research-description">
                      {researchItems[key]["bullets"].map((bullet, j) => (
                          <FadeInSection key={j} delay={(j + 1) * 100 + "ms"}>
                            <li>{bullet}</li>
                          </FadeInSection>
                      ))}
                    </ul>
                  </TabPanel>
              ))}
            </Box>
          </Box>
        </FadeInSection>
      </div>
  );
};

export default Research;
