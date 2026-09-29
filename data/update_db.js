const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
let data = {};

try {
  data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (e) {
  console.error('Error reading db.json', e);
}

// 1. Update Statistics & Settings
data.settings = data.settings || {};
data.settings.stats = {
  studentsTrained: "50,000+",
  workshops: "200+",
  schools: "50+",
  yearsExp: "10+"
};

// 2. Build the exact Courses array requested
const newCourses = [
  {
    "id": "course-1",
    "title": "Robotics with Electronics",
    "slug": "robotics-with-electronics",
    "category": "Robotics",
    "shortDescription": "Build, program, and innovate with industry-leading microcontrollers and component-based robotics.",
    "description": "Learn to design, build, and program autonomous robots with core electronics and microcontrollers. Covers circuits, sensors, actuators, control systems, and real-world projects starting from component level.",
    "duration": "3 – 6 Months",
    "level": "Beginner to Advanced",
    "mode": "Offline / Online",
    "image": "/assets/course_robotics.jpg",
    "highlights": [
      "Core Electronics & Circuit Design",
      "Arduino & Microcontroller Architecture",
      "Sensors & Actuators Interfacing",
      "Robot Chassis Design & Mechanical Assembly",
      "Motor Drivers & H-Bridge Control",
      "Autonomous Obstacle Avoiding Robot Project"
    ],
    "status": "active",
    "displayOrder": 1,
    "createdAt": "2026-09-18T08:17:25.937Z"
  },
  {
    "id": "course-2",
    "title": "Artificial Intelligence(AI)",
    "slug": "artificial-intelligence-ai",
    "category": "AI",
    "shortDescription": "Explore the frontiers of Artificial Intelligence, Computer Vision, and smart automation.",
    "description": "A comprehensive journey into Artificial Intelligence, intelligent decision systems, image classifiers, and interactive AI models.",
    "duration": "3 - 8 Months",
    "level": "Beginner Friendly",
    "mode": "Offline / Online",
    "image": "/assets/course_ai_python.jpg",
    "highlights": [
      "Artificial Intelligence Fundamentals",
      "Data Analysis & Feature Engineering",
      "OpenCV & Computer Vision Basics",
      "Speech Recognition & Audio Processing",
      "Building Intelligent Decision Agents",
      "Capstone AI Project Presentation"
    ],
    "status": "active",
    "displayOrder": 2,
    "createdAt": "2026-09-18T08:17:25.955Z"
  },
  {
    "id": "course-3",
    "title": "Internet of Things(IoT)",
    "slug": "internet-of-things-iot",
    "category": "IoT",
    "shortDescription": "Connect physical devices to the cloud and build real-time smart home & telemetry systems.",
    "description": "Hands-on engineering with ESP32/ESP8266 Wi-Fi microcontrollers, cloud dashboards, REST APIs, and MQTT sensor telemetry.",
    "duration": "3 - 6 Months",
    "level": "Intermediate",
    "mode": "Offline / Online",
    "image": "/assets/course_iot_esp32.jpg",
    "highlights": [
      "ESP32 Architecture & Pinouts",
      "Wireless Wi-Fi & Bluetooth Stacks",
      "Sensor Telemetry & MQTT Protocols",
      "Cloud Dashboards & Mobile Control",
      "Smart Home Automation Prototype",
      "Data Security for IoT Nodes"
    ],
    "status": "active",
    "displayOrder": 3,
    "createdAt": "2026-09-18T08:17:25.955Z"
  },
  {
    "id": "course-computational-thinking",
    "title": "Computational Thinking",
    "slug": "computational-thinking",
    "category": "Coding & Logic",
    "shortDescription": "Develop algorithmic problem-solving, pattern recognition, and logical deduction using visual blocks and Python.",
    "description": "Computational Thinking equips young minds with foundational computer science logic, decomposition techniques, flowchart architecture, and structured problem-solving applicable across all emerging technologies.",
    "duration": "2 - 4 Months",
    "level": "Beginner Friendly",
    "mode": "Offline / Online",
    "image": "/assets/course_comp_thinking.jpg",
    "highlights": [
      "Pattern Recognition & Problem Decomposition",
      "Algorithmic Logic & Flowchart Design",
      "Visual Coding & Python Logic Bridges",
      "Interactive Game Logic & Simulations",
      "Critical Thinking & Debugging Skills",
      "Capstone Logic Challenge"
    ],
    "status": "active",
    "displayOrder": 4,
    "createdAt": "2026-09-25T02:00:00.000Z"
  },
  {
    "id": "course-undergraduate-workshop",
    "title": "Free one Day workshop",
    "slug": "free-one-day-workshop",
    "category": "Engineering & Robotics",
    "shortDescription": "Intensive hands-on masterclass covering hardware-software co-design, electronics, and IoT.",
    "description": "Designed for college and university students. Provides deep, industry-level practical exposure to autonomous robotics, microcontroller interfacing, IoT cloud dashboards, and embedded firmware development with project kits.",
    "duration": "1-Day Free Workshop",
    "level": "Undergraduate / Advanced",
    "mode": "In-Person Lab & College Campus",
    "image": "/assets/course_ug_workshop.jpg",
    "highlights": [
      "Industry Microcontrollers & Electronics Architecture",
      "Autonomous Sensor Integration & Motor Control",
      "IoT Cloud Gateways & Real-Time Telemetry",
      "PCB Design & Hardware Troubleshooting",
      "Capstone Mini-Project & Hardware Kit",
      "Authorized Certification from Edueme Research Labs"
    ],
    "status": "active",
    "displayOrder": 5,
    "createdAt": "2026-09-25T02:00:00.000Z"
  }
];

// Append remaining courses from current db
const remaining = (data.courses || []).filter(c => 
  !['course-1', 'course-2', 'course-3', 'course-computational-thinking', 'course-undergraduate-workshop'].includes(c.id) &&
  !['robotics-with-embedded-c', 'robotics-with-electronics', 'ai-with-python', 'artificial-intelligence-ai', 'iot-with-embedded-c', 'internet-of-things-iot', 'computational-thinking', 'undergraduate-workshop', 'free-one-day-workshop'].includes(c.slug)
);

let order = 6;
remaining.forEach(c => {
  c.displayOrder = order++;
});

data.courses = [...newCourses, ...remaining];

// 3. Add rich Events collection
data.events = [
  {
    "id": "event-1",
    "title": "Free One-Day Undergraduate Workshop in Robotics & AI",
    "slug": "free-one-day-undergraduate-workshop",
    "category": "Workshops",
    "type": "upcoming",
    "date": "Saturday, 18th October 2026",
    "timings": "8:30 AM to 5:30 PM",
    "location": "Edueme Research Labs — Madhapur Innovation Center, Hyderabad",
    "shortDescription": "Full-day comprehensive masterclass on microcontroller architecture, autonomous robotics, and AI vision for undergraduate students.",
    "description": "Join our premier hands-on workshop designed specifically for college and university undergraduate students. Learn Embedded C programming, wire and program autonomous line-tracking & obstacle-avoidance robots, interface IoT sensors, and deploy vision algorithms. Hardware kits provided for live experimentation.",
    "image": "/assets/workshop_flyer.jpg",
    "photos": [
      "/assets/workshop_flyer.jpg",
      "/assets/course_ug_workshop.jpg",
      "/assets/events_hero.jpg"
    ],
    "highlights": [
      "Full Day Hands-on Sessions (8:30 AM – 5:30 PM)",
      "Component-level Hardware Kits Included",
      "Guided by Senior Research Scientists & Physicists",
      "Official Certificate of Completion & Project Portfolio"
    ],
    "status": "active",
    "displayOrder": 1,
    "createdAt": "2026-09-25T00:00:00.000Z"
  },
  {
    "id": "event-2",
    "title": "National STEM Innovation Expo & Championship 2026",
    "slug": "national-stem-innovation-expo-2026",
    "category": "Exhibitions",
    "type": "upcoming",
    "date": "14th – 15th November 2026",
    "timings": "8:30 AM to 5:30 PM",
    "location": "Hyderabad International Convention Centre (HICC), Hyderabad",
    "shortDescription": "Telangana's largest school STEM exhibition featuring 500+ student-built robots, smart IoT prototypes, and AI solutions.",
    "description": "Edueme Research Labs presents the annual STEM Innovation Expo (Pradarshan). Over 50 partner schools and 2,000+ young innovators will exhibit working prototypes across Agriculture Tech, Smart Cities, HealthTech, and Autonomous Transport before an eminent jury of scientists and educators.",
    "image": "/assets/events_hero.jpg",
    "photos": [
      "/assets/events_hero.jpg",
      "/assets/event_robowars.jpg"
    ],
    "highlights": [
      "500+ Working Student Prototypes",
      "Cash Prizes & Innovation Grants totaling ₹5,00,000",
      "Live Drone & Robot Demonstration Arenas",
      "Keynote talks by University Scientists"
    ],
    "status": "active",
    "displayOrder": 2,
    "createdAt": "2026-09-25T00:00:00.000Z"
  },
  {
    "id": "event-3",
    "title": "Inter-School RoboWars & Obstacle Navigation Derby",
    "slug": "inter-school-robowars-2026",
    "category": "Competitions",
    "type": "upcoming",
    "date": "28th November 2026",
    "timings": "8:30 AM to 5:30 PM",
    "location": "Samskar The Life School Campus, Hyderabad",
    "shortDescription": "High-octane robotics competition where student teams battle in customized arenas and timed maze navigation.",
    "description": "An action-packed engineering showdown pitting middle and high school students against challenging courses. Categories include Line Follower Sprint, RoboMaze Solver, and Heavyweight Robot Combat in an armored cage.",
    "image": "/assets/event_robowars.jpg",
    "photos": [
      "/assets/event_robowars.jpg",
      "/assets/events_hero.jpg"
    ],
    "highlights": [
      "Timed Precision Maze Navigation",
      "Robo-Combat Cage Match",
      "Live Scoreboards & Referee Review",
      "Trophies, Medals & National Rank Badges"
    ],
    "status": "active",
    "displayOrder": 3,
    "createdAt": "2026-09-25T00:00:00.000Z"
  },
  {
    "id": "event-4",
    "title": "Prayogshala School Innovation Program & Tech Showcase",
    "slug": "prayogshala-school-innovation-showcase",
    "category": "School programs",
    "type": "past",
    "date": "August 2026",
    "timings": "8:30 AM to 5:30 PM",
    "location": "Arka International School Campus",
    "shortDescription": "Inauguration and live student demonstration of component-based robotics lab setup.",
    "description": "Successfully completed 3-day Prayogshala lab orientation program where 350+ students from Grades 3 through 10 built their first sensor-driven hardware circuits and micro-robots.",
    "image": "/assets/srv_prayogshala.jpg",
    "photos": [
      "/assets/srv_prayogshala.jpg",
      "/assets/course_robotics.jpg"
    ],
    "highlights": [
      "350+ Students Participated",
      "Turnkey Prayogshala Lab Setup",
      "100% Practical Component Assembly",
      "Teacher Mentorship Handover"
    ],
    "status": "active",
    "displayOrder": 4,
    "createdAt": "2026-09-20T00:00:00.000Z"
  },
  {
    "id": "event-5",
    "title": "Anveshana Tech Immersion Tour — IIT Hyderabad Visit",
    "slug": "anveshana-tech-tour-iit-hyderabad",
    "category": "Other activities",
    "type": "past",
    "date": "July 2026",
    "timings": "8:30 AM to 5:30 PM",
    "location": "IIT Hyderabad Campus & Incubation Centers, Kandi",
    "shortDescription": "Guided university tech immersion tour taking 120 school students inside premier robotics research facilities.",
    "description": "Students explored state-of-the-art additive manufacturing, drone wind tunnels, and AI computer vision labs at IIT Hyderabad, interacting directly with professors and doctoral researchers.",
    "image": "/assets/srv_anveshana.jpg",
    "photos": [
      "/assets/srv_anveshana.jpg",
      "/assets/course_ug_workshop.jpg"
    ],
    "highlights": [
      "120 School Students Mentored",
      "Exclusive Access to IIT R&D Labs",
      "Interactions with University Researchers",
      "Technical Tour Dossier & Certification"
    ],
    "status": "active",
    "displayOrder": 5,
    "createdAt": "2026-09-10T00:00:00.000Z"
  }
];

// Save to db.json
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated db.json with new courses, stats, and events!');
