# Edueme Research Labs — Mobile-First Web Platform & Admin CMS

Dynamic business website and Admin Management Panel for **Edueme Research Labs** (Think. Create. Innovate. / Learn. Practice. Achieve.).
Built for STEM, Robotics, AI, and IoT education programs.

---

## 🚀 Features

- **Mobile-First App Experience**: Edge-to-edge image-led hero, bottom app navigation, touch drawers, and responsive layouts.
- **Pioneering Course Catalog**: Filterable courses (Robotics with Embedded C, AI with Python, IoT with ESP32, Machine Learning, Mechatronics) with batch enrolment tags and detailed syllabi.
- **Comprehensive Services & Sub-Services**:
  - Prayogshala (Component-based Tech Labs)
  - Hands-on Workshops
  - Tech Tours (Anveshana)
  - Year-End & Summer Bootcamps
  - Dedicated sub-service route: `/services/:serviceSlug/:subServiceSlug`
- **Dynamic Gallery**: Categorized photo gallery (Workshops, Competitions, Tech Tours, Labs).
- **Social Proof & Authority**: Partner schools ticker (Mount Carmel, Samskar Global, Phoenix Greens, Arka International) and real school principal testimonials.
- **Unified Lead System**:
  - Course and service pre-tagging on inquiry
  - 10-digit phone & email validation
  - Real-time WhatsApp & Email alert dispatching
  - Lead management CRM with CSV export
- **Admin Management Panel (`/admin`)**:
  - Leads management (status tracking: New, Contacted, Converted)
  - Courses CRUD (add, edit, delete, active/inactive)
  - Services & Sub-Services CRUD
  - Gallery CRUD (reorder, categorize, toggle)
  - Team Members CRUD
  - Homepage Banners & Global Settings management

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express 5, CORS, REST API
- **Data Persistence**: JSON-based persistent database (`data/db.json`) with automated backup and default seeding
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Mobile-First responsive tokens), Vanilla JavaScript (Single Page Application Router)
- **Design Tokens**: Plus Jakarta Sans, Outfit, Deep Tech Navy (`#0e1628`), Amber Gold (`#f5a623`), Mint Accent (`#00d090`)

---

## 💻 Quick Start & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/neelhari/surender.git
   cd surender
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Access the platform**:
   - **Public Website**: [http://localhost:3005](http://localhost:3005)
   - **Admin Panel**: [http://localhost:3005/admin](http://localhost:3005/admin)

### Admin Default Credentials:
- **Email**: `admin@edueme.com`
- **Password**: `admin123`

---

## 🏢 Registered Office

**Edueme Research Labs**  
1-98/11/62, Arunodaya Colony, Sri Sai Nagar,  
Madhapur, Hyderabad, Telangana - 500081  
Helpline: +91 90595 08050  
Email: info@eduemeresearchlabs.com
