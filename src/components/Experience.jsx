import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import FadeInSection from "./FadeInSection";
import "../styles/Experience.css";

function TabPanel({ children, value, index, isMobile }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={isMobile ? `full-width-tabpanel-${index}` : `vertical-tabpanel-${index}`}
      aria-labelledby={isMobile ? `full-width-tab-${index}` : `vertical-tab-${index}`}
    >
      {value === index && (
        <Box className="experience-tab-panel-content">
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  isMobile: PropTypes.bool,
};

function a11yProps(index, isMobile) {
  const prefix = isMobile ? "full-width" : "vertical";
  return {
    id: `${prefix}-tab-${index}`,
    "aria-controls": `${prefix}-tabpanel-${index}`,
  };
}

const experienceItems = {
  "Yum! Consulting": {
    jobTitle: "Software Engineer Intern @",
    duration: "MAY 2026 - AUG 2026",
    desc: [
      "Designed a configurable multi-step LLM pipeline for hierarchical restaurant-review classification and tag extraction",
      "Built FastAPI services with asynchronous OpenAI-compatible model calls, connection pooling, retries, timeout control, and concurrency throttling",
      "Implemented safe conditional execution, dynamic output mapping, structured parsing, SQLite caching, and Feishu Bitable-backed configuration",
    ],
  },
  "Digital Suzhou": {
    jobTitle: "AI Engineer Intern @",
    duration: "AUG 2025 - SEP 2025",
    desc: [
      "Built a customer-service knowledge base, internal dashboard prototype, and AI conversational integration using Dify",
      "Worked across requirements analysis, system design, front-end development, and back-end workflow configuration",
      "Designed end-to-end test cases covering user interactions, data displays, APIs, and core business processes",
    ],
  },
  "Siemens Ltd.": {
    jobTitle: "Software Engineer Intern @",
    duration: "SEP 2024 - FEB 2025",
    desc: [
      "Contributed to DO Deck, an Excel-integrated automation tool for recorded scripts, data retrieval, Power Query, and VBA workflows",
      "Maintained servers, databases, and permissions; authored UiPath automation scripts and performed functional testing",
      "Provided technical support and maintained the product's Hugo-based documentation site",
    ],
  },
};

const Experience = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div id="experience">
      <FadeInSection>
        <div className="section-header ">
          <span className="section-title">/ experience</span>
        </div>
        <Box className="experience-container">
          <Tabs
            orientation={isMobile ? "horizontal" : "vertical"}
            variant="scrollable"
            scrollButtons="auto"
            value={value}
            onChange={(_event, newValue) => setValue(newValue)}
            className="experience-tabs"
          >
            {Object.keys(experienceItems).map((key, index) => (
              <Tab
                key={key}
                label={key}
                {...a11yProps(index, isMobile)}
                className="experience-tab"
              />
            ))}
          </Tabs>
          <Box className="experience-panel">
            {Object.entries(experienceItems).map(([company, item], index) => (
              <TabPanel key={company} value={value} index={index} isMobile={isMobile}>
                <span className="experience-job-title">{item.jobTitle} </span>
                <span className="experience-job-company">{company}</span>
                <div className="experience-duration">{item.duration}</div>
                <ul className="job-description">
                  {item.desc.map((description, descriptionIndex) => (
                    <FadeInSection key={description} delay={`${(descriptionIndex + 1) * 100}ms`}>
                      <li>{description}</li>
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

export default Experience;
