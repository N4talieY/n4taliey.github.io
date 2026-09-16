import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import FadeInSection from "./FadeInSection";
import "../styles/Publications.css";

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

const Publications = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const pubItems = {
    "Learning Performance": {
      title: "Physiological Multimodal Signals Reflect Students’ Learning Performance: A Novel Deep Learning Approach",
      // authors: "Xinyi Yang, Yihan Li, Xujia Ning, Yi Ni, Erick Purwanto, Filbert H Juwono",
      date: "2024.08",
      summary: "Uses convolutional neural networks with multimodal EEG and eye-tracking signals to assess learner concentration and performance for timely teacher intervention.",
    },
    "Breast Cancer Diagnosis": {
      title: "Advancing Breast Cancer Diagnosis: A Comprehensive Study of Machine Learning Algorithms on Histological Tumor Characteristics",
      // authors: "Fanming Sun, Xinyi Yang",
      date: "2023.08",
      doi: "10.1109/ICDSI60108.2023.00064",
      summary: "Compares machine-learning algorithms on histological tumor characteristics to classify breast tumors as benign or malignant.",
    },
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
      <div id="publications">
        <FadeInSection>
          <div className="section-header ">
            <span className="section-title">/ publications</span>
          </div>

          <Box className="pub-container">
            <Tabs
                orientation={!isMobile ? "vertical" : "horizontal"}
                variant="scrollable"
                scrollButtons="auto"
                value={value}
                onChange={handleChange}
                className="pub-tabs"
            >
              {Object.keys(pubItems).map((key, i) => (
                  <Tab
                      key={i}
                      label={key}
                      {...a11yProps(i, isMobile)}
                      className="pub-tab"
                  />
              ))}
            </Tabs>
            <Box className="pub-panel">
              {Object.keys(pubItems).map((key, i) => (
                  <TabPanel key={i} value={value} index={i} isMobile={isMobile}>
                    <div className="pub-job-title">
                      {pubItems[key]["title"]}
                    </div>
                    <div className="pub-duration">
                      {pubItems[key]["date"]}
                    </div>
                    <ul className="pub-description">
                      <FadeInSection delay="100ms">
                        <li><b>Summary:</b> {pubItems[key]["summary"]}</li>
                      </FadeInSection>
                      {pubItems[key]["doi"] && (
                          <FadeInSection delay="150ms">
                            <li><b>DOI:</b> {pubItems[key]["doi"]}</li>
                          </FadeInSection>
                      )}
                    </ul>
                  </TabPanel>
              ))}
            </Box>
          </Box>
        </FadeInSection>
      </div>
  );
};

export default Publications;
