export const rfc1925Truths = [
  { number: "2", text: "No matter how hard you push and no matter what the priority, you can't increase the speed of light." },
  { number: "3", text: "With sufficient thrust, pigs fly just fine. However, this is not necessarily a good idea. It is hard to be sure where they are going to land, and it could be dangerous sitting under them as they fly overhead." },
  { number: "4", text: "Some things in life can never be fully appreciated nor understood unless experienced firsthand. Some things in networking can never be fully understood by someone who neither builds commercial networking equipment nor runs an operational network." },
  { number: "5", text: "It is always possible to aglutenate multiple separate problems into a single complex interdependent solution. In most cases this is a bad idea." },
  { number: "6", text: "It is easier to move a problem around (for example, by moving the problem to a different part of the overall network architecture) than it is to solve it." },
  { number: "6a", text: "It is always possible to add another level of indirection." },
  { number: "7", text: "It is always something." },
  { number: "7a", text: "Good, Fast, Cheap: Pick any two (you can't have all three)." },
  { number: "8", text: "It is more complicated than you think." },
  { number: "9", text: "For all resources, whatever it is, you need more." },
  { number: "9a", text: "Every networking problem always takes longer to solve than it seems like it should." },
  { number: "10", text: "One size never fits all." },
  { number: "11", text: "Every old idea will be proposed again with a different name and a different presentation, regardless of whether it works." },
  { number: "11a", text: "See rule 6a." },
  { number: "12", text: "In protocol design, perfection has been reached not when there is nothing left to add, but when there is nothing left to take away." },
];

const careerStartDate = new Date(2008, 8); // September 2008
const now = new Date();
const yearsOfExperience = Math.floor(
  (now.getTime() - careerStartDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
);

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  employmentType?: string;
  presentation: "featured" | "compact" | "earlier";
  summaryGroup?: "short-2017";
  summaryBullets?: string[];
  bullets: string[];
}

export const resume = {
  yearsOfExperience,
  name: "Hani Qurayshi",
  nickname: "Hani Q",
  officialName: "Hanan Ilyas Qureshi",
  title: "Founder, ArkaType Intelligence",
  workEmail: "hani@arka-type.com",
  email: "hanan.ilyas@gmail.com",
  phone: "+966532534616",
  linkedin: "https://www.linkedin.com/in/haniqurayshi/",
  twitter: "https://x.com/haniq313",
  github: "hani-q",
  profileImage: "/profile.jpeg",

  overview: {
    summary:
      `Founder of ArkaType Intelligence, building Agentic Cyber Intelligence with FlowSense.AI. Its Deep Packet Intelligence engine explains what network traffic is doing without decrypting it. ${yearsOfExperience}+ years in Network Intelligence, Cloud Architecture and Cyber Security, leading teams and using coding agents throughout engineering. An <a href="https://www.rfc-editor.org/rfc/rfc1925" target="_blank" rel="noopener noreferrer" class="underline hover:text-blue-500">RFC 1925</a>-compatible engineer.`,
    highlights: [
      "Founder of ArkaType Intelligence (2026), building FlowSense.AI: on-device Deep Packet Intelligence, with agents that act on what it finds under rules you control",
      "Consultant Agentic Engineering at Stealth Startup (Contract), where I set up a dedicated Agentic Software Engineering team and led adoption of AI-assisted development",
      "Experience in DPI, Network Analytics and Cloud Solutions at Sandvine and PLUMgrid (acquired by VMware)",
      "Full-stack engineer using React, React Native, Next.js, Node.js, Java Spring and Go, with work on payment back ends and finance dashboards",
      "Three AWS certifications, with experience in Cloud Architecture, DevSecOps, MLOps and Infrastructure as Code",
      "Led cross-functional teams and established Centers of Excellence",
      "Technical expertise: Agentic AI, Network Security, DPDK, Cloud Architecture, Kubernetes, AI/ML, DevSecOps, Terraform/OpenTofu",
      "Global work experience across UAE, KSA, USA, Sweden, and Pakistan in both startup and enterprise environments",
    ],
  },

  skills: {
    programming: [
      "Golang",
      "TypeScript/JavaScript",
      "Python",
      "C/C++",
      "Java",
      "PHP",
      "React",
      "React Native",
      "Kotlin",
      "Astro",
      "Next.js",
      "Node.js",
      "Express",
      "Hono",
      "Expo",
    ],
    cloudDevops: [
      "AWS",
      "OCI",
      "GCP",
      "Kubernetes",
      "OpenStack",
      "Terraform/OpenTofu",
      "Docker Compose",
      "Ansible",
      "CI/CD (GitHub Actions, Jenkins, GitLab CI)",
      "ArgoCD",
      "GitOps",
      "Kafka/Redpanda",
      "Gerrit",
    ],
    databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "CockroachDB", "ClickHouse", "Firebase", "AWS Amplify"],
    observability: ["Elasticsearch", "Logstash", "Kibana", "Grafana", "Prometheus", "Vector"],
    networking: ["DPDK", "DPI", "NFV/VNF", "PCRF", "Network Analytics", "Traffic Management"],
    aiMl: ["TensorFlow", "PyTorch", "MLOps", "Agentic AI (Claude Code, Codex, OpenClaw, Greptile)", "LLM Integration", "Reinforcement Learning"],
    security: ["DevSecOps", "Cyber Security", "Regulatory Compliance"],
    leadership: ["Agile/Scrum", "Kanban/Scrumban", "Team Building & Scaling", "Engineering Culture", "Cross-functional Leadership", "Hiring & Mentoring", "OKRs & Roadmapping", "Vendor & Stakeholder Management"],
  },

  experience: [
    {
      title: "Founder",
      company: "ArkaType Intelligence",
      location: "Delaware, USA (Remote)",
      period: "January 2026 - Present",
      presentation: "featured",
      summaryBullets: [
        "Founded ArkaType Intelligence to build FlowSense.AI, a Deep Packet Intelligence engine for encrypted network traffic.",
        "Lead product and engineering across application recognition, experience scoring, and anomaly analysis.",
        "Designed an on-device, privacy-first architecture that analyzes traffic behavior without decrypting content.",
      ],
      bullets: [
        "Founded ArkaType Intelligence Inc. on 5 January 2026 to build Agentic Cyber Intelligence: network intelligence that explains what traffic is doing without reading what it carries.",
        "Lead product and engineering of FlowSense.AI, a Deep Packet Intelligence engine that recognizes applications in encrypted traffic without decrypting it, combining custom-trained ML models, behavioral heuristics, signatures, and protocol parsers for TLS, QUIC, HTTP, and DNS.",
        "Designed its three-stage pipeline: recognize the application, score the experience (delay, throughput, time to first response), and use anomaly models to turn evidence into a likely cause and a suggested next step.",
        "Set a privacy-first architecture, \"inspection without surveillance\": analyze packet sizes, timing, and flow behavior, never message content, call media, or model prompts, with processing on hardware the user owns.",
        "Shaping use cases across homes, businesses, AI infrastructure, and operators: AI inference observability, application QoE, network visibility, connection investigation, digital wellness, parental control, privacy awareness, and device visibility.",
      ],
    },
    {
      title: "Consultant Agentic Engineering",
      company: "Stealth Startup",
      employmentType: "Contract",
      location: "Makkah, Saudi Arabia (Remote)",
      period: "November 2024 - July 2026",
      presentation: "featured",
      bullets: [
        "Set up and led a dedicated Agentic Software Engineering team as part of building the engineering org from scratch.",
        "Led adoption of AI-assisted development across engineering, using Claude Code, OpenAI Codex, and self-hosted models.",
        "Wrote the org's guidelines and best practices for using coding agents safely.",
      ],
    },
    {
      title: "Solutions Engineer",
      company: "Sandvine",
      location: "Riyadh, Saudi Arabia",
      period: "November 2017 - October 2024",
      presentation: "featured",
      summaryBullets: [
        "Delivered network intelligence solutions using DPI, PCRF, and NFV for telecom operators in the Middle East.",
        "Led the Centre of Excellence for Traffic Classification, including signature development.",
        "Developed deployment designs, an automated packet-capture analysis portal, and CI/CD pipelines with Jenkins and Docker.",
        "Provided technical leadership for pre-sales, customer training, and engineer mentoring.",
      ],
      bullets: [
        "Led implementation of large-scale network intelligence and analytics solutions using Sandvine's DPI, PCRF, NFV technologies for major telecom operators in the Middle East",
        "Architected and deployed network solutions integrating regulatory compliance, traffic management, and analytics systems for telecom operators",
        "Developed High-Level and Low-Level Designs (HLD/LLD) for critical deployments and migration projects, ensuring minimal service disruption",
        "Led the Centre of Excellence for Traffic Classification, including signature development.",
        "Created an automated packet capture analysis portal integrating CDN and AS information for troubleshooting",
        "Designed custom signatures for network traffic analysis using proprietary languages and tools",
        "Set up CI/CD pipelines using Jenkins and Docker",
        "Provided technical leadership in pre-sales activities",
        "Mentored junior engineers and conducted technical training sessions for customers and internal teams",
      ],
    },
    {
      title: "Manager Professional Services",
      company: "SNSKIES",
      location: "Islamabad, Pakistan",
      period: "May 2017 - October 2017",
      presentation: "compact",
      summaryGroup: "short-2017",
      summaryBullets: [
        "Led professional services delivery and an engineering team, working with Cisco, Sandvine, and Sangfor.",
      ],
      bullets: [
        "Led an engineering team delivering projects for customers.",
        "Managed project delivery against agreed timelines and budgets.",
        "Used customer feedback surveys to assess service delivery.",
        "Collaborated with industry partners including Cisco, Sandvine, and Sangfor.",
      ],
    },
    {
      title: "Country Manager / FullStack Engineer",
      company: "Simplus Innovation",
      location: "Islamabad, Pakistan",
      period: "April 2017 - October 2017",
      presentation: "compact",
      summaryGroup: "short-2017",
      summaryBullets: [
        "Established the Pakistan office and built analytics products with React, TypeScript, MongoDB, and AWS.",
      ],
      bullets: [
        "Collaborated with product management to deliver tailored analytics solutions.",
        "Implemented Agile methodologies for efficient project management.",
        "Established the Pakistan office and led a team of engineers.",
        "Utilized React, TypeScript, MongoDB, Redux, Pesapal, and AWS.",
      ],
    },
    {
      title: "Co-Founder & Chief Architect",
      company: "Vincere Systems",
      location: "Islamabad, Pakistan",
      period: "June 2016 - September 2017",
      presentation: "compact",
      summaryBullets: [
        "Co-founded a telecom software business and delivered a customized ACS product to wi-tribe Pakistan.",
      ],
      bullets: [
        "Founded a company specializing in custom solutions for telecom and ISP domain.",
        "Delivered a customized ACS product to wi-tribe Pakistan.",
        "Facilitated smooth migration to a new frequency spectrum across the country.",
      ],
    },
    {
      title: "Head of Networks",
      company: "Zigron Inc.",
      location: "Islamabad, Pakistan",
      period: "March 2017 - May 2017",
      presentation: "compact",
      summaryGroup: "short-2017",
      summaryBullets: [
        "Led teams working across DPI, IoT, analytics, cloud, and network function virtualization.",
      ],
      bullets: [
        "Led technical teams in DPI, IoT, Analytics, Cloud, and VNF domains.",
        "Developed and executed the company's technical strategic goals.",
        "Implemented efficient processes for large-scale enterprise projects.",
      ],
    },
    {
      title: "Manager Digital Services - Cloud",
      company: "PTCL",
      location: "Islamabad, Pakistan",
      period: "January 2017 - March 2017",
      presentation: "compact",
      summaryGroup: "short-2017",
      summaryBullets: [
        "Managed cloud products, service development, and corporate pre-sales.",
      ],
      bullets: [
        "Managed Cloud Digital Products & Service Development.",
        "Oversaw product management, pre-sales, and relationship management for corporate segment.",
        "Supported sales and customer adoption of cloud services.",
      ],
    },
    {
      title: "Principal Design Engineer",
      company: "PLUMgrid Inc. (Acquired by VMware)",
      location: "Santa Clara, California (Remote)",
      period: "May 2014 - January 2017",
      presentation: "featured",
      summaryBullets: [
        "Developed OpenStack networking and security features, including microsegmentation, VXLAN overlays, and L2 VTEP services.",
        "Built the PLUMgrid Object Model API with Node.js and maintained automated regression-testing infrastructure.",
        "Contributed to NFV platform development, technical roadmaps, and customer-facing architecture discussions.",
      ],
      bullets: [
        "Architected and implemented security policy VNF features enabling microsegmentation and zero-trust networking for OpenStack environments",
        "Designed and developed L2 VTEP service supporting VXLAN overlay networks, improving network scalability for multi-tenant cloud deployments",
        "Led development of the PLUMgrid Object Model API in Node.js, giving network services one configuration interface",
        "Built and maintained automated testing infrastructure (PITA) for regression testing and release quality",
        "Contributed to core platform development including network function virtualization (VNF), infrastructure automation, and web services",
        "Collaborated with product management to define technical roadmap and feature prioritization for cloud networking products",
        "Mentored junior engineers and led knowledge sharing sessions on cloud networking technologies and best practices",
        "Participated in customer-facing technical discussions and provided solutions for complex networking requirements",
        "Authored technical documentation and design specifications for platform features and APIs",
      ],
    },
    {
      title: "Software Engineer, SCRUM Master",
      company: "Seamless Payments AB",
      location: "Stockholm, Sweden",
      period: "November 2013 - April 2014",
      presentation: "earlier",
      summaryBullets: [
        "Developed Java Spring services for mobile payments and led Agile delivery as SCRUM Master.",
      ],
      bullets: [
        "Led Agile transformation as SCRUM Master for the development team",
        "Architected and implemented a real-time transaction processing system for mobile payments",
        "Developed high-performance REST APIs using Java Spring Framework for mobile money transfer services",
        "Implemented automated CI/CD pipelines",
        "Established code review practices and quality metrics",
        "Conducted daily stand-ups, sprint planning, and retrospective meetings to ensure team alignment and continuous improvement",
      ],
    },
    {
      title: "System Engineer",
      company: "Seamless Payments AB",
      location: "Stockholm, Sweden",
      period: "September 2011 - November 2013",
      presentation: "earlier",
      summaryBullets: [
        "Built SEQR payment-processing services and worked on the Djibouti Telecom CBIO Implementation project, associated with Seamless Distribution AB.",
      ],
      bullets: [
        "Worked on the Djibouti Telecom CBIO Implementation project, associated with Seamless Distribution AB, starting in September 2012.",
        "Designed and implemented core payment processing modules for SEQR mobile payment platform using Java and Spring Framework",
        "Built backend services for concurrent transaction processing",
        "Developed integration modules for major banks and payment providers across Europe",
        "Created an automated testing framework for regression testing",
        "Implemented monitoring and alerting systems using ELK stack for real-time transaction tracking",
        "Optimized database queries and cache implementations",
        "Collaborated with cross-functional teams across Sweden, Pakistan, and Ghana for feature delivery",
        "Participated in on-call support rotation for system availability",
        "Mentored junior developers and conducted technical training sessions on payment systems",
      ],
    },
    {
      title: "Technical Executive (North)",
      company: "wi-tribe",
      location: "Islamabad, Pakistan",
      period: "December 2008 - August 2011",
      presentation: "earlier",
      summaryBullets: [
        "Built an in-house WiMAX analytics platform with another engineer, replacing Motorola's licensed product and ending payments for it.",
        "Built network-data collection and customer-care tools, including DeReg, to investigate CPE connectivity and signal issues.",
      ],
      bullets: [
        "Built an in-house WiMAX analytics platform in 2009 with one other engineer, replacing Motorola's expensive, separately licensed network analytics product; wi-tribe stopped paying Motorola for it",
        "Wrote crawlers to log in over SSH to more than 150 base stations across Islamabad/Rawalpindi, Lahore, and Karachi and scrape data into a database on a schedule; built an Advanced Analytics Portal on top",
        "Built the DeReg tool for customer care: agents entered a customer's CPE (modem) ID to see which cell sites it had connected to and why it was not getting a proper signal, the network's most critical support issue; every customer care agent used it on 24/7 shifts",
        "Led network operations and service delivery for broadband subscribers across Islamabad/Rawalpindi, Lahore, and Karachi",
        "Designed and implemented a custom network monitoring portal built with MRTG and Adobe Flex, to speed up fault finding and repair",
        "Led the migration from a legacy billing system to a convergent billing platform",
        "Wrote Python scripts for network performance analysis and automated reporting",
        "Implemented QoS policies and traffic shaping rules to manage peak-hour congestion",
        "Managed relationships with vendors including Motorola (wi-tribe's WiMAX network vendor), Cisco, Juniper, and Huawei for network equipment and services",
        "Created network documentation and standard operating procedures (SOPs) for technical teams",
        "Led technical training programs for new hires and existing staff on networking fundamentals and troubleshooting",
        "Member of the 24/7 escalation team for network availability across all regions",
      ],
    },
    {
      title: "Intern",
      company: "wi-tribe",
      location: "Islamabad, Pakistan",
      period: "September 2008 - November 2008",
      presentation: "earlier",
      summaryBullets: [],
      bullets: [
        "Assisted in network deployment and configuration for WiMAX broadband services",
        "Developed monitoring scripts using Python and Shell for automated health checks of network elements",
        "Contributed to documentation of network topology and technical procedures",
        "Participated in troubleshooting customer connectivity issues and network performance optimization",
        "Collaborated with senior engineers in implementing QoS policies for different service packages",
        "Gained hands-on experience with WiMAX technology, network monitoring tools, and Linux systems",
      ],
    },
  ] satisfies Experience[],

  certifications: [
    "Claude Code in Action | Anthropic | 2026",
    "Complete DevOps Ansible Automation Training | Udemy | 2024",
    "Unsupervised Machine Learning, Recommenders, Reinforcement Learning | Stanford University | 2024",
    "Advanced Machine Learning Algorithms | Stanford University | 2024",
    "Supervised Machine Learning, Regression and Classification | Stanford University | 2023",
    "AWS Certified Solutions Architect - Professional | Amazon Web Services (AWS) | 2024",
    "AWS Certified Solutions Architect - Associate | Amazon Web Services (AWS) | 2023",
    "HashiCorp Certified: Terraform Associate | HashiCorp | 2024",
    "AWS Learning: Serverless | Amazon Web Services (AWS) | 2024",
    "AWS Certified Cloud Practitioner | Amazon Web Services (AWS) | 2024",
    "AWS Learning: Architecting | Amazon Web Services (AWS) | 2023",
    "EdX Verified Certificate for Bitcoin and Cryptocurrencies | edX | 2022",
  ],

  education:
    "Bachelor of Electrical Engineering | Computer | Centre for Advanced Studies in Engineering (CASE), UET Taxila | Islamabad, Pakistan | 2010",

  honors: [
    {
      title: "Best Engineering Design",
      issuer: "National Engineering Robotics Contest (NERC), EME, NUST, Pakistan",
      date: "July 2009",
      description: "Won the Best Engineering Design award at the National Engineering Robotics Contest held at EME, NUST on 11 July 2009.",
    },
    {
      title: "Outstanding Performance (A+) Rating, 2009",
      issuer: "wi-tribe Pakistan",
      date: "April 2010",
      description: "Rated A+ (Outstanding Performance) in the 2009 annual appraisal and awarded performance pay.",
    },
  ],

  involvement: {
    organization: "Qasmia Welfare Trust",
    location: "Islamabad, Pakistan",
    role: "IT Consultant",
    period: "July 2018 - Present",
    bullets: [
      "Designed and implemented a finance tracking system using Next.js, TypeScript, Material UI, and Tailwind.",
      "Utilized AWS Amplify for backend infrastructure to ensure scalability and reliability.",
      "Enabled field operatives to efficiently manage donations and expenses during campaigns.",
      "Integrated invoicing capabilities and audit data storage for compliance and transparency.",
      "Created dynamic reporting dashboards with react-charts for real-time data visualization.",
      "Transitioned legacy Android-based application from Google Firebase to AWS Amplify.",
    ],
  },
};
